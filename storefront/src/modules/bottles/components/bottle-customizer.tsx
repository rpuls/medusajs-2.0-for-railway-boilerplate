"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import * as fabric from "fabric"
import { FabricImage } from "fabric"
import type { HttpTypes } from "@medusajs/types"

import { addToCartSafe } from "@lib/data/cart"
import { phCapture } from "@lib/posthog"
import { buildCustomizerMetadataBase } from "@modules/customizer/lib/build-metadata"
import type {
  GarmentSide,
  RenderPlacement,
} from "@modules/customizer/lib/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import {
  BOTTLE_LABEL_SIDE_LABEL,
  getBottlePrintSides,
  type BottleSpec,
} from "../lib/bottle-label-spec"

type Props = {
  product: HttpTypes.StoreProduct
  countryCode: string
  bottleSpec: BottleSpec
  /** Currently-selected variant (when product has size/capacity variants). */
  selectedVariantId: string | null
}

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

/** Pixels per centimetre on the in-browser label canvas — keeps text and uploaded artwork at a consistent scale. */
const CANVAS_DPCM = 24

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error ?? new Error("read failed"))
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.readAsDataURL(file)
  })

const productPrimaryImage = (
  product: HttpTypes.StoreProduct
): string | null => {
  if (Array.isArray(product.images) && product.images[0]?.url) {
    return product.images[0].url
  }
  return product.thumbnail ?? null
}

export default function BottleCustomizer({
  product,
  countryCode,
  bottleSpec,
  selectedVariantId,
}: Props) {
  const sides = useMemo(() => getBottlePrintSides(bottleSpec), [bottleSpec])
  const [activeSide, setActiveSide] = useState<GarmentSide>(sides[0])
  const [textInput, setTextInput] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [addedOk, setAddedOk] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const htmlCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const layoutsRef = useRef<Partial<Record<GarmentSide, Record<string, unknown>[]>>>({})

  const labelCm = useMemo(() => {
    if (activeSide === "bottle_back_label" && bottleSpec.backLabelCm) {
      return bottleSpec.backLabelCm
    }
    return bottleSpec.frontLabelCm
  }, [activeSide, bottleSpec])

  const labelPx = useMemo(
    () => ({
      width: Math.round(labelCm.width * CANVAS_DPCM),
      height: Math.round(labelCm.height * CANVAS_DPCM),
    }),
    [labelCm]
  )

  const productImage = productPrimaryImage(product)

  // Initialise / re-initialise the Fabric canvas when the active side changes.
  useEffect(() => {
    const htmlCanvas = htmlCanvasRef.current
    if (!htmlCanvas) return

    const canvas = new fabric.Canvas(htmlCanvas, {
      width: labelPx.width,
      height: labelPx.height,
      backgroundColor: "rgba(255,255,255,0.92)",
      preserveObjectStacking: true,
    })
    fabricCanvasRef.current = canvas

    const persist = () => {
      const json = canvas.toJSON()
      layoutsRef.current[activeSide] = json.objects as Record<string, unknown>[]
    }
    canvas.on("object:added", persist)
    canvas.on("object:removed", persist)
    canvas.on("object:modified", persist)

    // Restore any existing layout for this side
    const existing = layoutsRef.current[activeSide]
    if (existing && existing.length > 0) {
      canvas
        .loadFromJSON({ objects: existing, background: "rgba(255,255,255,0.92)" } as any)
        .then(() => canvas.renderAll())
    } else {
      canvas.renderAll()
    }

    return () => {
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [activeSide, labelPx.width, labelPx.height])

  const handleUpload = async (files: FileList | null) => {
    const canvas = fabricCanvasRef.current
    if (!files?.length || !canvas) return
    setUploadError(null)

    for (const file of Array.from(files)) {
      if (!/^image\/(png|jpe?g|svg\+xml)$/.test(file.type)) {
        setUploadError("Upload PNG, JPG, or SVG only.")
        return
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setUploadError("Each file must be 8MB or smaller.")
        return
      }

      try {
        const dataUrl = await readFileAsDataUrl(file)
        const img = await FabricImage.fromURL(dataUrl)
        img.set({
          customizerLabel: file.name || "Artwork",
          sourceWidthPx: img.width ?? 0,
          sourceHeightPx: img.height ?? 0,
        })

        // Fit to about 70% of label width
        const targetW = labelPx.width * 0.7
        if (img.getScaledWidth() > targetW && img.scaleToWidth) {
          img.scaleToWidth(targetW)
        }
        img.set({
          left: labelPx.width / 2 - img.getScaledWidth() / 2,
          top: labelPx.height / 2 - img.getScaledHeight() / 2,
        })

        canvas.add(img)
        canvas.setActiveObject(img)
        canvas.renderAll()
        phCapture("bottle_customizer_design_uploaded", {
          product_id: product.id,
          side: activeSide,
          file_size: file.size,
          file_type: file.type,
        })
      } catch (err) {
        setUploadError(
          err instanceof Error ? err.message : "Could not load that image."
        )
      }
    }
  }

  const handleAddText = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    const text = textInput.trim()
    if (!text) return
    const obj = new fabric.Textbox(text, {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 24,
      fill: "#1a1a2e",
      textAlign: "center",
      left: labelPx.width / 2,
      top: labelPx.height / 2,
      originX: "center",
      originY: "center",
      width: labelPx.width * 0.7,
    })
    canvas.add(obj)
    canvas.setActiveObject(obj)
    canvas.renderAll()
    setTextInput("")
  }

  const handleDelete = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    const active = canvas.getActiveObjects()
    if (!active.length) return
    active.forEach((o) => canvas.remove(o))
    canvas.discardActiveObject()
    canvas.renderAll()
  }

  // Track once on mount that the customizer was opened.
  useEffect(() => {
    phCapture("bottle_customizer_started", {
      product_id: product.id,
      product_title: product.title,
      spirit_type: bottleSpec.spiritType,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Medusa's `calculated_price.calculated_amount` is in major units (dollars),
   * not cents. We treat it as the per-bottle price and scale to cents in the
   * `CustomizerMetadata.pricing` payload so production tracking + analytics
   * stay consistent with the apparel customizer.
   */
  const variantPriceMajor = useMemo(() => {
    if (!selectedVariantId) return 0
    const v = product.variants?.find((x) => x.id === selectedVariantId) as any
    const amount = v?.calculated_price?.calculated_amount
    return typeof amount === "number" ? amount : 0
  }, [product, selectedVariantId])

  const totalCents = Math.round(variantPriceMajor * 100) * quantity
  const formatAUD = (cents: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(cents / 100)

  const handleAddToCart = useCallback(async () => {
    setAddError(null)
    setAddedOk(false)
    if (!selectedVariantId) {
      setAddError("Pick a bottle option first.")
      return
    }
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    // Persist the active side before serialising.
    const activeJson = canvas.toJSON()
    layoutsRef.current[activeSide] = activeJson.objects as Record<string, unknown>[]

    const hasAnyArt = Object.values(layoutsRef.current).some(
      (arr) => (arr ?? []).length > 0
    )
    if (!hasAnyArt) {
      setAddError("Add at least one design element to your label.")
      return
    }

    setAdding(true)
    try {
      const printArea: RenderPlacement = {
        x: 0,
        y: 0,
        width: labelPx.width,
        height: labelPx.height,
      }
      const metadata = buildCustomizerMetadataBase({
        productId: product.id,
        sideLayoutsBySide: layoutsRef.current,
        printArea,
        sizes: [],
        pricing: {
          baseUnitPriceCents: Math.round(variantPriceMajor * 100),
          sideSurchargePerUnitCents: 0,
          sideSurchargeTotalCents: 0,
          quantityDiscountRate: 0,
          hasBulkPricing: false,
          discountedUnitPriceCents: Math.round(variantPriceMajor * 100),
          totalPriceCents: Math.round(variantPriceMajor * 100) * quantity,
        },
        activeSide,
      })

      const result = await addToCartSafe({
        variantId: selectedVariantId,
        quantity,
        countryCode,
        metadata: {
          ...metadata,
          variantId: selectedVariantId,
        },
      })
      if (!result.ok) throw new Error(result.error)

      phCapture("bottle_customizer_added_to_cart", {
        product_id: product.id,
        variant_id: selectedVariantId,
        quantity,
        sides_decorated: Object.entries(layoutsRef.current).filter(
          ([, v]) => (v ?? []).length > 0
        ).length,
        spirit_type: bottleSpec.spiritType,
      })
      setAddedOk(true)
    } catch (err) {
      setAddError(
        err instanceof Error ? err.message : "Could not add to cart."
      )
    } finally {
      setAdding(false)
    }
  }, [
    activeSide,
    bottleSpec.spiritType,
    countryCode,
    labelPx.height,
    labelPx.width,
    product.id,
    quantity,
    selectedVariantId,
    variantPriceMajor,
  ])

  return (
    <div className="grid grid-cols-1 gap-8 medium:grid-cols-12">
      {/* Bottle preview + canvas overlay */}
      <div className="medium:col-span-7">
        <div className="relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-subtle">
          {productImage ? (
            <img
              src={productImage}
              alt={product.title ?? "Bottle"}
              className="absolute inset-0 h-full w-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-ui-fg-subtle text-sm">
              No bottle image yet
            </div>
          )}

          {/* Canvas: positioned over the bottle's label area. v1: centered, ~30% of bottle photo. */}
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "55%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <canvas
              ref={htmlCanvasRef}
              width={labelPx.width}
              height={labelPx.height}
              className="rounded shadow-md ring-1 ring-[var(--brand-primary)]/20"
              style={{ background: "rgba(255,255,255,0.85)" }}
            />
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-ui-fg-subtle">
          Print area: {labelCm.width}cm × {labelCm.height}cm at 300 DPI UV-DTF
        </p>
      </div>

      {/* Right rail */}
      <div className="medium:col-span-5">
        <div className="flex flex-col gap-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--brand-primary)]/80">
              {bottleSpec.spiritType ?? "Custom bottle"}
              {bottleSpec.capacityMl ? ` · ${bottleSpec.capacityMl}ml` : ""}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-ui-fg-base">
              {product.title}
            </h1>
            {product.description ? (
              <p className="mt-2 text-sm text-ui-fg-subtle">
                {product.description}
              </p>
            ) : null}
          </div>

          {sides.length > 1 ? (
            <div className="flex flex-wrap gap-2">
              {sides.map((side) => (
                <button
                  key={side}
                  type="button"
                  onClick={() => setActiveSide(side)}
                  className={
                    "rounded-full border px-4 py-1.5 text-sm transition " +
                    (activeSide === side
                      ? "border-[var(--brand-secondary)] bg-[var(--brand-secondary)] text-white"
                      : "border-ui-border-base text-ui-fg-base hover:bg-ui-bg-subtle")
                  }
                >
                  {BOTTLE_LABEL_SIDE_LABEL[side] ?? side}
                </button>
              ))}
            </div>
          ) : null}

          <fieldset className="rounded-xl border border-ui-border-base p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-ui-fg-subtle">
              Add to your design
            </legend>
            <div className="flex flex-col gap-y-3 mt-2">
              <label className="flex flex-col gap-y-1">
                <span className="text-xs text-ui-fg-subtle">
                  Upload artwork (PNG / JPG / SVG, ≤8MB)
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  onChange={(e) => handleUpload(e.currentTarget.files)}
                  className="text-sm"
                />
                {uploadError ? (
                  <span className="text-xs text-ui-tag-red-icon">{uploadError}</span>
                ) : null}
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.currentTarget.value)}
                  placeholder="Add a personalised line…"
                  className="flex-1 rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2 text-sm"
                  maxLength={120}
                />
                <button
                  type="button"
                  onClick={handleAddText}
                  disabled={!textInput.trim()}
                  className="rounded-md border border-ui-border-base px-3 py-2 text-sm hover:bg-ui-bg-subtle disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              <button
                type="button"
                onClick={handleDelete}
                className="self-start text-xs text-ui-fg-subtle hover:text-ui-tag-red-icon"
              >
                Delete selected
              </button>
            </div>
          </fieldset>

          <div className="rounded-xl border border-ui-border-base p-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="bottle-qty">
                Quantity
              </label>
              <input
                id="bottle-qty"
                type="number"
                min={1}
                max={1000}
                value={quantity}
                onChange={(e) => {
                  const v = parseInt(e.currentTarget.value, 10)
                  setQuantity(Number.isFinite(v) && v > 0 ? v : 1)
                }}
                className="w-20 rounded-md border border-ui-border-base bg-ui-bg-base px-2 py-1 text-right text-sm"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-ui-fg-subtle">Estimated total</span>
              <span className="font-medium text-ui-fg-base">
                {formatAUD(totalCents)}
              </span>
            </div>
            <p className="mt-1 text-xs text-ui-fg-subtle">
              Final price confirmed at checkout. Includes UV-DTF label printing.
            </p>
          </div>

          {addError ? (
            <p className="text-sm text-ui-tag-red-icon">{addError}</p>
          ) : null}
          {addedOk ? (
            <p className="text-sm text-ui-tag-green-icon">
              Added to your cart.{" "}
              <LocalizedClientLink
                href="/cart"
                className="underline hover:text-ui-fg-base"
              >
                View cart →
              </LocalizedClientLink>
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding || !selectedVariantId}
            className="rounded-full bg-[var(--brand-secondary)] px-6 py-3 text-sm font-medium text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add bottle to cart"}
          </button>

          {!selectedVariantId ? (
            <p className="text-xs text-ui-fg-subtle">
              Pick a bottle option above to continue.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
