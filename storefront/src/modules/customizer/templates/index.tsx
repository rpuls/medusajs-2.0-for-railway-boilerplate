"use client"

import { addScpLineItemToCartSafe, addToCartSafe, deleteLineItem, getScpCartAggregate, retrieveCart } from "@lib/data/cart"
import { createMyDesign, getMyDesign } from "@lib/data/designs"
import { getOrderLineCustomizerMetadata } from "@lib/data/orders"
import CustomizerProductPicker, {
  type CustomizerPickerProduct,
} from "@modules/customizer/components/customizer-product-picker"
import LowResolutionModal from "@modules/customizer/components/low-resolution-modal"
import { buildCustomizerMetadataBase } from "@modules/customizer/lib/build-metadata"
import {
  DPI_CRITICAL_THRESHOLD,
  assessCanvasDpi,
  effectiveDpiForFabricImage,
  type DpiAssessment,
} from "@modules/customizer/lib/dpi"
import { resolvePdpFlyImageSrc } from "@modules/common/components/fly-to-cart-add-button"
import CanvasStage from "@modules/customizer/components/canvas-stage"
import DesignPreviewPopover from "@modules/customizer/components/design-preview-popover"
import InputPanel from "@modules/customizer/components/input-panel"
import ManagementPanel from "@modules/customizer/components/management-panel"
import PricingPanel from "@modules/customizer/components/pricing-panel"
import SideSelector from "@modules/customizer/components/side-selector"
import { getStoreProductTagValues } from "@lib/util/product-tags"
import {
  extractRenderArtifactUrl,
  normalizePersistedArtifactUrl,
} from "@modules/customizer/lib/artifact-url"
import { resolveGarmentImageUrlForCustomizerRender } from "@modules/customizer/lib/garment-url-for-render"
import { calculatePricing } from "@modules/customizer/lib/pricing"
import {
  DEFAULT_SCP_PRINT_SIZE_ID,
  SCP_A6_ONLY_SIDES,
  SCP_PRINT_SIZE_OPTIONS,
  SCP_PRINT_UNIT_MATRIX,
  getAllowedScpPrintSizesForSide,
  resolveScpPrintSizeForSide,
  resolveScpTierIndexForQuantity,
  type ScpPrintSizeId,
} from "@modules/customizer/lib/scp-dtf-print-pricing"
import { getDisplayUnitMinorForVariant } from "@lib/util/get-product-price"
import { sanitizeCustomizerDesignForCart } from "@modules/customizer/lib/sanitize-cart-metadata"
import { uploadCustomerOriginalUnchanged } from "@modules/customizer/lib/upload-customer-original"
import { extractCartDesigns, filterByKind } from "@lib/util/cart-decorations"
import { sanitizeCartAddError } from "@lib/util/sanitize-cart-error"
import {
  getVariantStockState,
  type VariantStockState,
} from "@modules/products/lib/variant-stock"
import {
  BulkPricingTier,
  CUSTOMIZER_PRINT_NOTES_MAX_LENGTH,
  CustomizerMetadata,
  DecorationMethod,
  EmbroideryConfig,
  GarmentSide,
  PrintSpec,
  SizeQuantity,
} from "@modules/customizer/lib/types"
import DecorationMethodPicker from "@modules/customizer/components/decoration-method-picker"
import EmbroiderySideConfig from "@modules/customizer/components/embroidery-side-config"
import {
  canvasPxToApproxCm,
  printSpecsToPricingSpecs,
  snapSizeForBoundingCm,
} from "@modules/customizer/lib/print-spec"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { useProductOptionsOptional } from "@modules/products/context/product-options-context"
import { useCustomizeModeOptional } from "@modules/products/context/customize-mode-context"
import { sortApparelSizeLabels } from "@modules/products/lib/apparel-size-order"
import {
  getGarmentImageUrlForPrintSide,
  getPrimaryGarmentImageUrl,
  isBeanieGarmentProduct,
  isHatGarmentProduct,
  isLongSleeveGarmentProduct,
} from "@modules/products/lib/variant-options"
import { sampleImageDominantColor } from "@modules/customizer/lib/sample-image-color"
import { HttpTypes } from "@medusajs/types"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { motion } from "framer-motion"
import { trackCustomizerAction, trackCustomizerFunnel } from "@lib/analytics"
import { phCapture } from "@lib/posthog"
import * as fabric from "fabric"
import { FabricImage } from "fabric"

const DESIGN_SIDES: GarmentSide[] = ["front", "back", "left_sleeve", "right_sleeve", "printed_tag"]
const MAX_UPLOAD_SIZE = 8 * 1024 * 1024
const PRINT_AREA_INCHES = { width: 12, height: 16 }
const SESSION_UPLOADS_KEY = "customizer_uploads_v1"
/** Ignore sub-pixel drift from Fabric so small moves inside the box don’t show a “clipped” alert. */
const PRINT_AREA_EPS = 1.5
/** Skip clamp until the canvas has a real size (avoids pinning art to a corner when printArea is ~0). */
const MIN_PRINT_AREA_PX = 8
/**
 * Default cap on top-level Fabric objects per side. Each object is one
 * transfer in production, so unlimited additions create orders the print
 * room rejects. Hats are tighter than this (single transfer on the crown);
 * see `MAX_PRINTS_PER_SIDE_HAT`.
 */
const MAX_PRINTS_PER_SIDE = 4
const MAX_PRINTS_PER_SIDE_HAT = 1

/** Initial on-canvas width for uploads when the print area is not sized yet (avoids Fabric Image width/scale bugs). */
const getTargetArtworkWidth = (printAreaWidth: number) => Math.max(120, printAreaWidth * 0.35)

/**
 * Place freshly added artwork to fit within the current print area at the
 * largest representative size — so picking A6 vs A4 vs A3 actually shows the
 * customer what their print will look like at that scale on the garment.
 */
const fitObjectToPrintArea = (
  obj: { scaleToWidth?: (w: number) => void; scaleToHeight?: (h: number) => void; width?: number; height?: number; scaleX?: number; scaleY?: number },
  area: { width: number; height: number }
) => {
  const margin = 0.96 // small breathing room inside the print rectangle
  const targetW = area.width * margin
  const targetH = area.height * margin
  obj.scaleToWidth?.(targetW)
  // Fabric's scaleToWidth uses width only — if the result is taller than the
  // print area, downscale further by height so the image fits inside both.
  const scaledH = (obj.height ?? 0) * (obj.scaleY ?? 1)
  if (scaledH > targetH && obj.scaleToHeight) {
    obj.scaleToHeight(targetH)
  }
}

const getFabricImageSourceWidthPx = (obj: any): number => {
  const direct = Number(obj?.sourceWidthPx ?? 0)
  if (direct > 0) {
    return direct
  }
  const w = obj?.width
  if (typeof w === "number" && w > 0) {
    return w
  }
  const el = obj?._element as HTMLImageElement | undefined
  if (el?.naturalWidth) {
    return el.naturalWidth
  }
  return 0
}

const getFabricImageSourceHeightPx = (obj: any): number => {
  const direct = Number(obj?.sourceHeightPx ?? 0)
  if (direct > 0) {
    return direct
  }
  const h = obj?.height
  if (typeof h === "number" && h > 0) {
    return h
  }
  const el = obj?._element as HTMLImageElement | undefined
  if (el?.naturalHeight) {
    return el.naturalHeight
  }
  return 0
}

type CustomizerTemplateProps = {
  defaultGarmentImage: string | null
  defaultGarmentTitle: string | null
  product: HttpTypes.StoreProduct
  /** When true, section is embedded on PDP (section heading, no page-level duplicate chrome). */
  embedded?: boolean
  /** Embedded only: Medusa variant id from ProductActions (colour/size). */
  pdpSyncedVariantId?: string | null
  /** Embedded PDP: gallery + variant pickers slot into one grid with the editor (single page layout). */
  integratedPdpSlots?: {
    gallery: ReactNode
    variantPickers: ReactNode
  }
  /**
   * Catalog products available in the in-customizer "Change product" picker.
   * Only used by the standalone /customizer route — PDP embeds always know
   * their product up front and never show the picker.
   */
  pickerProducts?: CustomizerPickerProduct[]
}

// Visual-only dimensions used to scale the dashed print-area guide on the
// canvas. These are tuned against the photographed garment so each size *looks*
// like the print a customer will actually receive — they are NOT the true
// printable dimensions used for pricing or production. The customer-facing
// label dimensions live in `SCP_PRINT_SIZE_OPTIONS` (scp-dtf-print-pricing.ts).
//
// "Oversize" matches the full 68%×72% canvas footprint (≈ a real garment-wide
// print). A3 and A4 are pulled in so the rectangle reads more like a normal
// chest print rather than swallowing the whole tee, otherwise customers expect
// a print larger than what they're paying for. A6 is small enough already.
const SCP_PRINT_SIZE_CM: Record<ScpPrintSizeId, { w: number; h: number }> = {
  up_to_a6: { w: 8, h: 12 },
  up_to_a4: { w: 14, h: 20 },
  up_to_a3: { w: 19, h: 27 },
  oversize: { w: 38, h: 48 },
}
const SCP_BASE_REF = SCP_PRINT_SIZE_CM.oversize

const getPrintArea = (
  width: number,
  height: number,
  printSizeId: ScpPrintSizeId = "oversize"
) => {
  const baseW = width * 0.68
  const baseH = height * 0.72
  const refSize = SCP_PRINT_SIZE_CM[printSizeId] ?? SCP_BASE_REF
  const scaleW = refSize.w / SCP_BASE_REF.w
  const scaleH = refSize.h / SCP_BASE_REF.h
  const areaW = baseW * scaleW
  const areaH = baseH * scaleH
  // Shift smaller print areas down toward the chest line. Oversize keeps the
  // legacy top-anchor at 13%; smaller sizes blend toward 30% so they don't end
  // up sitting on the hood/collar of hoodies and similar garments.
  const sizeRatio = areaH / baseH // 1.0 for oversize, ~0.31 for A6
  const topRatioMin = 0.13
  const topRatioMax = 0.30
  const topRatio = topRatioMin + (topRatioMax - topRatioMin) * (1 - sizeRatio)
  return {
    x: (width - areaW) / 2,
    y: height * topRatio,
    width: areaW,
    height: areaH,
  }
}

const productMetadataShowsDtfTierEstimator = (product: HttpTypes.StoreProduct) => {
  const m = product.metadata as Record<string, unknown> | undefined
  return m?.show_dtf_tier_estimator === true
}

const resolveVariantPrice = (
  variant?: HttpTypes.StoreProductVariant,
  product?: HttpTypes.StoreProduct | null
) => {
  const variantRecord = variant as any
  const calculated = variantRecord?.calculated_price?.calculated_amount
  if (typeof calculated === "number") {
    const merged =
      product?.handle != null
        ? {
            ...variantRecord,
            product: {
              ...(variantRecord.product ?? {}),
              handle:
                (typeof variantRecord.product?.handle === "string" &&
                  variantRecord.product.handle) ||
                product.handle,
            },
          }
        : variantRecord
    return getDisplayUnitMinorForVariant(merged)
  }

  const amount = variantRecord?.prices?.find((price: any) => typeof price?.amount === "number")?.amount
  if (typeof amount === "number") {
    return amount
  }

  return 0
}

const variantHasConfiguredPrice = (variant?: HttpTypes.StoreProductVariant) => {
  const variantRecord = variant as any
  if (typeof variantRecord?.calculated_price?.calculated_amount === "number") {
    return true
  }
  return Array.isArray(variantRecord?.prices)
    ? variantRecord.prices.some((price: any) => typeof price?.amount === "number")
    : false
}

const toFiniteNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return null
}

const resolveVariantBulkPricingTiers = (
  variant?: HttpTypes.StoreProductVariant
): BulkPricingTier[] => {
  const metadata = (variant?.metadata ?? {}) as Record<string, unknown>
  const bulkPricing = metadata.bulk_pricing as
    | {
        tiers?: Array<Record<string, unknown>>
      }
    | undefined

  if (!Array.isArray(bulkPricing?.tiers)) {
    return []
  }

  return bulkPricing.tiers
    .map((tier): BulkPricingTier | null => {
      const minQuantity = toFiniteNumber(tier.min_quantity)
      const maxQuantity = toFiniteNumber(tier.max_quantity)
      const amountCents = toFiniteNumber(tier.amount)
      if (minQuantity === null || amountCents === null) {
        return null
      }
      return {
        minQuantity,
        maxQuantity: maxQuantity ?? undefined,
        amountCents,
      }
    })
    .filter((tier): tier is BulkPricingTier => tier !== null)
    .sort((a, b) => a.minQuantity - b.minQuantity)
}

const getSizeOption = (product: HttpTypes.StoreProduct) =>
  product.options?.find((option) => (option.title ?? "").toLowerCase().includes("size"))

const getNonSizeOptions = (product: HttpTypes.StoreProduct) =>
  (product.options ?? []).filter((option) => !(option.title ?? "").toLowerCase().includes("size"))

const variantMatchesNonSizeOptions = (
  variant: HttpTypes.StoreProductVariant,
  product: HttpTypes.StoreProduct,
  reference: HttpTypes.StoreProductVariant
) => {
  const nonSize = getNonSizeOptions(product)
  const refMap = new Map(
    (reference.options ?? []).map((entry) => [entry.option_id, entry.value ?? ""])
  )
  return nonSize.every((opt) => {
    const want = refMap.get(opt.id) ?? ""
    const got = variant.options?.find((e) => e.option_id === opt.id)?.value ?? ""
    return want === got
  })
}

const uniqueSizesForVariant = (
  product: HttpTypes.StoreProduct,
  reference: HttpTypes.StoreProductVariant
): SizeQuantity[] => {
  const sizeOption = getSizeOption(product)
  const basePool = (product.variants ?? []).filter((v) =>
    variantMatchesNonSizeOptions(v, product, reference)
  )
  const pricedPool = basePool.filter((variant) => variantHasConfiguredPrice(variant))
  const pool = pricedPool.length ? pricedPool : basePool
  const seen = new Set<string>()
  const sizes: string[] = []
  for (const v of pool) {
    const sizeValue = sizeOption
      ? (v.options?.find((e) => e.option_id === sizeOption.id)?.value ?? "")
      : (v.title ?? "Default")
    if (!sizeValue || seen.has(sizeValue)) {
      continue
    }
    seen.add(sizeValue)
    sizes.push(sizeValue)
  }
  if (!sizes.length) {
    return [{ size: "Default", quantity: 0 }]
  }
  return sortApparelSizeLabels(sizes).map((size) => ({ size, quantity: 0 }))
}

/**
 * Mirror of `uniqueSizesForVariant` that returns the actual variant per
 * size value, so callers can look up inventory state. Uses the same
 * non-size option matching so colour-locked size pickers resolve to the
 * variant that would actually be added to the cart.
 */
const variantBySizeForReference = (
  product: HttpTypes.StoreProduct,
  reference: HttpTypes.StoreProductVariant
): Map<string, HttpTypes.StoreProductVariant> => {
  const sizeOption = getSizeOption(product)
  const basePool = (product.variants ?? []).filter((v) =>
    variantMatchesNonSizeOptions(v, product, reference)
  )
  const pricedPool = basePool.filter((variant) => variantHasConfiguredPrice(variant))
  const pool = pricedPool.length ? pricedPool : basePool
  const map = new Map<string, HttpTypes.StoreProductVariant>()
  for (const v of pool) {
    const sizeValue = sizeOption
      ? (v.options?.find((e) => e.option_id === sizeOption.id)?.value ?? "")
      : (v.title ?? "Default")
    if (!sizeValue || map.has(sizeValue)) continue
    map.set(sizeValue, v)
  }
  return map
}

const uniqueOptionValues = (product: HttpTypes.StoreProduct, optionId: string): string[] => {
  const values = new Set<string>()
  for (const v of product.variants ?? []) {
    const val = v.options?.find((e) => e.option_id === optionId)?.value
    if (val) {
      values.add(val)
    }
  }
  return Array.from(values).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
}

const findVariantAfterOptionChange = (
  product: HttpTypes.StoreProduct,
  reference: HttpTypes.StoreProductVariant,
  optionId: string,
  newValue: string
): HttpTypes.StoreProductVariant | undefined => {
  const sizeOption = getSizeOption(product)
  const currentSize = sizeOption
    ? reference.options?.find((e) => e.option_id === sizeOption.id)?.value
    : undefined
  const refMap = new Map(
    (reference.options ?? []).map((e) => [e.option_id, e.value ?? ""])
  )
  const nonSize = getNonSizeOptions(product)
  const matches = (v: HttpTypes.StoreProductVariant, relaxSize: boolean) => {
    if (v.options?.find((e) => e.option_id === optionId)?.value !== newValue) {
      return false
    }
    if (sizeOption && currentSize && !relaxSize) {
      const sv = v.options?.find((e) => e.option_id === sizeOption.id)?.value
      if (sv !== currentSize) {
        return false
      }
    }
    return nonSize.every((opt) => {
      if (opt.id === optionId) {
        return true
      }
      const want = refMap.get(opt.id) ?? ""
      const got = v.options?.find((e) => e.option_id === opt.id)?.value ?? ""
      return want === got
    })
  }
  const strictMatches = (product.variants ?? []).filter((v) => matches(v, false))
  const relaxedMatches = (product.variants ?? []).filter((v) => matches(v, true))
  return (
    strictMatches.find((variant) => variantHasConfiguredPrice(variant)) ??
    relaxedMatches.find((variant) => variantHasConfiguredPrice(variant)) ??
    strictMatches[0] ??
    relaxedMatches[0]
  )
}

const getObjectId = (object: any) => {
  if (!object.customizerId) {
    object.customizerId = `obj_${Math.random().toString(36).slice(2, 10)}`
  }

  return object.customizerId as string
}

const readFileAsText = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(new Error("Unable to read file"))
    reader.readAsText(file)
  })

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ""))
    reader.onerror = () => reject(new Error("Unable to read file"))
    reader.readAsDataURL(file)
  })

/**
 * Normalise a raster image upload by baking EXIF orientation into the pixel
 * data. Phone photos (especially iOS) routinely carry orientation metadata
 * that the browser's HTML <img> rendering applies but Fabric's SVG export
 * does NOT — Fabric serialises the un-rotated raw bytes, and Sharp on the
 * backend then renders the un-rotated image into the print PNG / mockup,
 * producing output that looks mirrored or rotated relative to what the
 * customer saw on screen.
 *
 * This rewrites the upload through a canvas using
 * `createImageBitmap(blob, { imageOrientation: "from-image" })` which
 * decodes with EXIF applied, then re-encodes as PNG with no EXIF metadata.
 * Server-side renders now see exactly what the customer saw.
 *
 * Falls back to the original data URL on any failure (very old browsers,
 * decode errors) so a transient issue never blocks the upload entirely.
 * SVGs skip this path — they're text, not raster, and have no EXIF.
 */
const normalizeRasterDataUrl = async (file: File, fallbackDataUrl: string): Promise<string> => {
  if (typeof window === "undefined") return fallbackDataUrl
  if (typeof createImageBitmap !== "function") return fallbackDataUrl
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
    try {
      const canvas = document.createElement("canvas")
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const ctx = canvas.getContext("2d")
      if (!ctx) return fallbackDataUrl
      ctx.drawImage(bitmap, 0, 0)
      return canvas.toDataURL("image/png")
    } finally {
      bitmap.close?.()
    }
  } catch {
    return fallbackDataUrl
  }
}

type SessionUploadAsset = {
  id: string
  name: string
  type: string
  dataUrl: string
  /** Hosted copy of the exact bytes the customer uploaded (MinIO/S3); optional if storage failed. */
  originalStorageUrl?: string
}

const loadSvgObject = async (svg: string) => {
  const loader = (fabric as any).loadSVGFromString
  if (!loader) {
    throw new Error("SVG loader is unavailable")
  }

  const maybePromise = loader(svg)
  if (maybePromise && typeof maybePromise.then === "function") {
    const result = await maybePromise
    return (fabric as any).util.groupSVGElements(result.objects, result.options)
  }

  return new Promise<any>((resolve, reject) => {
    loader(svg, (objects: any[], options: Record<string, unknown>) => {
      if (!objects?.length) {
        reject(new Error("Could not parse SVG"))
        return
      }
      resolve((fabric as any).util.groupSVGElements(objects, options))
    })
  })
}

const ExpandCollapsePlus = () => (
  <span className="relative h-5 w-5">
    <span className="absolute inset-y-[31.75%] left-[48%] right-1/2 w-[1.5px] rounded-full bg-ui-fg-subtle transition-all duration-300 group-open:rotate-90" />
    <span className="absolute inset-x-[31.75%] bottom-1/2 top-[48%] h-[1.5px] rounded-full bg-ui-fg-subtle transition-all duration-300 group-open:left-1/2 group-open:right-1/2 group-open:rotate-90" />
  </span>
)

function HelpTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex shrink-0">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-ui-bg-base-hover text-[9px] font-bold text-ui-fg-muted ring-1 ring-ui-border-base transition hover:bg-ui-bg-subtle hover:text-ui-fg-base focus:outline-none focus-visible:ring-2"
        aria-label="Help"
      >
        ?
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-5 top-0 z-50 w-60 rounded-lg border border-ui-border-base bg-ui-bg-base p-3 text-xs leading-relaxed text-ui-fg-base shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  )
}

export default function CustomizerTemplate({
  defaultGarmentImage,
  defaultGarmentTitle,
  product,
  embedded = false,
  pdpSyncedVariantId = null,
  integratedPdpSlots,
  pickerProducts,
}: CustomizerTemplateProps) {
  const params = useParams()
  const router = useRouter()
  const countryCode = String(params?.countryCode ?? "")
  const fabricCanvasRef = useRef<any>(null)
  /** Host div only — canvas is created imperatively so Fabric can replace/wrap it without breaking React siblings (garment img). */
  const fabricContainerRef = useRef<HTMLDivElement | null>(null)
  const htmlCanvasRef = useRef<HTMLCanvasElement | null>(null)

  /**
   * Resolver for EmbroiderySideConfig — returns a data URL of the artwork
   * currently placed on the canvas for the active side. Preference order:
   * 1) selected (active) object → just its bounds (best for multi-object sides)
   * 2) first top-level object on the canvas
   * Returns null when no artwork has been placed yet.
   */
  const getCurrentSideArtworkDataUrl = (): { dataUrl: string; mediaType: string } | null => {
    const canvas = fabricCanvasRef.current
    if (!canvas || typeof canvas.toDataURL !== "function") return null
    try {
      const active = canvas.getActiveObject?.()
      const target = active ?? canvas.getObjects?.()?.[0]
      if (!target) return null
      // Use the target object's bounding rect as the dataURL crop. Fabric's
      // toDataURL accepts left/top/width/height to clip to a specific region.
      const rect = target.getBoundingRect?.(true, true)
      if (!rect || rect.width <= 0 || rect.height <= 0) {
        // Fallback: whole-canvas screenshot if bounds are unavailable.
        const dataUrl = canvas.toDataURL({ format: "png", multiplier: 1 }) as string
        return dataUrl ? { dataUrl, mediaType: "image/png" } : null
      }
      const dataUrl = canvas.toDataURL({
        format: "png",
        multiplier: 1,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }) as string
      return dataUrl ? { dataUrl, mediaType: "image/png" } : null
    } catch {
      return null
    }
  }

  useLayoutEffect(() => {
    const host = fabricContainerRef.current
    if (!host) {
      return
    }
    const el = document.createElement("canvas")
    el.className = "absolute inset-0 h-full w-full touch-none"
    el.setAttribute("data-customizer-fabric", "lower")
    host.appendChild(el)
    htmlCanvasRef.current = el
    return () => {
      host.replaceChildren()
      htmlCanvasRef.current = null
    }
  }, [])
  const sideLayoutsRef = useRef<Record<GarmentSide, Record<string, unknown>[]>>({
    front: [],
    back: [],
    left_sleeve: [],
    right_sleeve: [],
    printed_tag: [],
  })
  /**
   * Per-object manual size override. Keyed by `customizerId`. When set the
   * auto-snap leaves that object alone — the customer has explicitly
   * chosen a size and we shouldn't yank it back when they nudge the box.
   */
  const manualSizeOverridesRef = useRef<Map<string, ScpPrintSizeId>>(new Map())
  /**
   * Most-recent upload signature, used to dedupe the iOS Safari double-fire
   * of `<input type="file">` change events. See the guard inside
   * `handleUploadFile` for the 1500ms reuse window.
   */
  const lastUploadSignatureRef = useRef<{ sig: string; at: number } | null>(null)

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [currentSide, setCurrentSide] = useState<GarmentSide>("front")
  /** Fabric listeners are registered once; read the latest side when persisting so we don’t always write to `front`. */
  const currentSideRef = useRef<GarmentSide>(currentSide)
  currentSideRef.current = currentSide
  /** Avoid persisting while clearing/loading the canvas — `clear()` emits removals that would wipe the wrong side. */
  const suppressFabricPersistenceRef = useRef(false)
  const [layers, setLayers] = useState<
    Array<{ id: string; label: string; visible: boolean; locked: boolean; type?: string }>
  >([])
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [outOfBoundsWarning, setOutOfBoundsWarning] = useState<string | null>(null)
  const [dpiWarning, setDpiWarning] = useState<string | null>(null)
  const [dpiAssessment, setDpiAssessment] = useState<DpiAssessment>({
    worstDpi: null,
    severity: "ok",
    imagesEvaluated: 0,
    imagesBelowCritical: 0,
  })
  const [lowResModalOpen, setLowResModalOpen] = useState(false)
  /** Once the customer dismisses the modal we don't keep re-opening it on every scale event. */
  const lowResModalDismissedRef = useRef(false)
  /** Funnel guard — fire `customizer_design_started` once per page load. */
  const designStartedFiredRef = useRef(false)
  const [vectorizationRequested, setVectorizationRequested] = useState(false)
  const [isRemovingVectorization, setIsRemovingVectorization] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDesign, setIsSavingDesign] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [printNotes, setPrintNotes] = useState("")
  // Seed from `?variant=` (e.g. when returning from cart) so the previously
  // chosen colour/size is reselected; falls back to the first variant.
  const initialVariantSearchParams = useSearchParams()
  const initialVariantIdFromUrl = initialVariantSearchParams?.get("variant") ?? null
  const [activeVariantId, setActiveVariantId] = useState<string>(() => {
    if (initialVariantIdFromUrl && product.variants?.some((v) => v.id === initialVariantIdFromUrl)) {
      return initialVariantIdFromUrl
    }
    return product.variants?.[0]?.id ?? ""
  })
  const [sizeMatrix, setSizeMatrix] = useState<SizeQuantity[]>([])
  const [sessionUploads, setSessionUploads] = useState<SessionUploadAsset[]>([])
  // Designs the customer has already attached to other cart items (typically
  // via the bundle wizard). Loaded once on mount; populates the InputPanel's
  // "From your cart" section so they can drop an existing artwork into the
  // canvas without re-uploading. Populated only when there's something to show.
  const [cartArtworkDesigns, setCartArtworkDesigns] = useState<
    Array<{ id: string; name: string; url: string }>
  >([])
  // Cross-cart bulk-tier aggregation projection. When the customer already
  // has eligible items in their cart, this number drives the green tier
  // highlight in <PricingPanel/> so they see "you're heading into the 50-99
  // tier with this design + your cart" instead of just this product's local
  // quantity. Null until the first fetch resolves; passing `undefined` to
  // PricingPanel disables the projection.
  const [aggregatedCartQuantity, setAggregatedCartQuantity] = useState<number | undefined>(undefined)
  const [layoutVersion, setLayoutVersion] = useState(0)
  const [scpPrintSizeId, setScpPrintSizeId] = useState<ScpPrintSizeId>(DEFAULT_SCP_PRINT_SIZE_ID)
  // Tracks whether the customer has actively chosen a size in the picker.
  // Pricing still uses `scpPrintSizeId` (defaulted to A6) so totals work pre-
  // selection, but the tile UI doesn't highlight anything until this flips
  // true. Re-hydration / re-edit flows set it via the same setter as the
  // size, so prior selections appear pre-selected on return.
  const [scpPrintSizeChosen, setScpPrintSizeChosen] = useState(false)
  const [showPrintAreaGuides, setShowPrintAreaGuides] = useState(false)
  // Guided PDP wizard: tracks the highest step the user has reached (1..4).
  // Steps below `pdpStep` collapse to summary chips with a "Change" link.
  const [pdpStep, setPdpStep] = useState<1 | 2 | 3 | 4>(1)
  const [pdpStep1Done, setPdpStep1Done] = useState(false)
  const [pdpStep2Done, setPdpStep2Done] = useState(false)
  // Record<GarmentSide, true> avoids Set spread which requires es2015+ target.
  const [sizingDoneSides, setSizingDoneSides] = useState<Partial<Record<GarmentSide, true>>>({})
  // pdpStep3Done: true once at least one side is sized — gates the upload panel
  const pdpStep3Done = Object.keys(sizingDoneSides).length > 0
  // currentSideSized: true when the active side has a confirmed size — collapses Step 3
  const currentSideSized = !!sizingDoneSides[currentSide]
  /**
   * Per-side decoration method (print | embroidery). Missing entries default
   * to "print" via getSideDecorationMethod() at read time. Stored as
   * Partial<Record> so only customer-touched sides take up metadata payload.
   * v3 schema field — see CustomizerMetadata.sideDecorationMethods.
   */
  const [sideDecorationMethods, setSideDecorationMethods] = useState<
    Partial<Record<GarmentSide, DecorationMethod>>
  >({})
  /**
   * Per-side embroidery config (mm dimensions + stitch count). Only populated
   * for sides whose method is "embroidery". v3 schema field — see
   * CustomizerMetadata.sideEmbroideryConfigs.
   */
  const [sideEmbroideryConfigs, setSideEmbroideryConfigs] = useState<
    Partial<Record<GarmentSide, EmbroideryConfig>>
  >({})
  /** True if any side currently uses embroidery — affects pricing + cart route choice. */
  const hasEmbroiderySide = Object.values(sideDecorationMethods).some(
    (m) => m === "embroidery"
  )
  // showSideNudge: brief banner when switching to an empty side in embedded mode
  const [showSideNudge, setShowSideNudge] = useState(false)
  // "Edit existing cart line" mode: when present, the customizer pre-fills from
  // the line metadata and "Add to cart" replaces (add new + delete old).
  const editLineItemIdFromUrl = initialVariantSearchParams?.get("edit") ?? null
  const [editLineItemId, setEditLineItemId] = useState<string | null>(editLineItemIdFromUrl)

  // Rehydration mode: `?design=<id>` (saved-design re-edit) or
  // `?reorder=<order_id>:<line_item_id>` (re-order from order history). Both
  // resolve to a CustomizerMetadata that we replay onto the canvas + state.
  const designIdFromUrl = initialVariantSearchParams?.get("design") ?? null
  const reorderRefFromUrl = initialVariantSearchParams?.get("reorder") ?? null
  const [pendingHydration, setPendingHydration] = useState<CustomizerMetadata | null>(null)
  const [hydrationApplied, setHydrationApplied] = useState(false)
  const [editingHydrated, setEditingHydrated] = useState(false)
  const [editingProductTitle, setEditingProductTitle] = useState<string | null>(null)
  const [editingPreviousSides, setEditingPreviousSides] = useState<GarmentSide[]>([])
  const [editingPreviousQty, setEditingPreviousQty] = useState<number>(0)
  const lastCustomizerProductIdRef = useRef<string | null>(null)
  const sideLoadVersionRef = useRef(0)
  const productOptionsFromPdp = useProductOptionsOptional()

  // (productIsLongSleeve / allowedSizesForCurrentSide are computed below,
  // after `selectedProduct` is in scope — they were moved to fix a
  // temporal-dead-zone "Cannot access … before initialization" error.)

  // Per-side effective print size (sleeves & printed tag are forced to A6 in
  // pricing, so the visible print area mirrors that constraint too).
  const effectivePrintSizeIdForArea = resolveScpPrintSizeForSide(
    currentSide,
    scpPrintSizeId
  ) as ScpPrintSizeId
  const printArea = useMemo(
    () =>
      getPrintArea(canvasSize.width, canvasSize.height, effectivePrintSizeIdForArea),
    [canvasSize.height, canvasSize.width, effectivePrintSizeIdForArea]
  )
  // Refs so the (one-time-bound) Fabric event handlers always read the current
  // print area + effective size when clamping.
  const printAreaRef = useRef(printArea)
  const effectivePrintSizeIdRef = useRef<ScpPrintSizeId>(effectivePrintSizeIdForArea)
  useEffect(() => {
    printAreaRef.current = printArea
  }, [printArea])
  useEffect(() => {
    effectivePrintSizeIdRef.current = effectivePrintSizeIdForArea
  }, [effectivePrintSizeIdForArea])

  // Load any artwork the customer has already attached to other cart items
  // (e.g. via the bundle wizard) so the InputPanel can offer a one-click
  // "reuse this design here too" option. Runs once on mount; we don't
  // re-fetch on cart mutations because the customer is actively building
  // a design — surprising them with new tiles mid-edit would be jarring.
  useEffect(() => {
    let cancelled = false
    void retrieveCart().then((cart) => {
      if (cancelled || !cart) return
      const designs = filterByKind(extractCartDesigns(cart), ["artwork"])
      const tiles = designs
        .filter((d) => d.artworkUrl)
        .map((d, i) => ({
          id: d.lineItemId || `cart-design-${i}`,
          name: d.bundleTitle ?? d.productTitle,
          url: d.artworkUrl as string,
        }))
      if (tiles.length > 0) setCartArtworkDesigns(tiles)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // When the effective print size shrinks (or the customer picks a smaller
  // size after placing artwork), enforce the new max scale on every existing
  // object so artwork can't stay larger than the print area allows.
  useEffect(() => {
    if (effectivePrintSizeIdForArea === "oversize") {
      return
    }
    const canvas = fabricCanvasRef.current
    const pr = printArea
    if (!canvas || pr.width < MIN_PRINT_AREA_PX || pr.height < MIN_PRINT_AREA_PX) {
      return
    }
    const objects = canvas.getObjects?.() ?? []
    let mutated = false
    for (const obj of objects) {
      const baseW = Math.max(1, (obj as any).width ?? 0)
      const baseH = Math.max(1, (obj as any).height ?? 0)
      const maxScaleX = pr.width / baseW
      const maxScaleY = pr.height / baseH
      const maxScale = Math.min(maxScaleX, maxScaleY)
      const sx = Math.abs((obj as any).scaleX ?? 1)
      const sy = Math.abs((obj as any).scaleY ?? 1)
      if (Math.max(sx, sy) > maxScale && Number.isFinite(maxScale) && maxScale > 0) {
        const sign = (v: number) => (v < 0 ? -1 : 1)
        ;(obj as any).set({
          scaleX: maxScale * sign((obj as any).scaleX ?? 1),
          scaleY: maxScale * sign((obj as any).scaleY ?? 1),
        })
        ;(obj as any).setCoords?.()
        mutated = true
      }
      // Also nudge back inside the new (potentially shifted) print rectangle.
      clampObjectToBounds(obj)
    }
    if (mutated) {
      canvas.requestRenderAll?.()
      saveCurrentSide?.()
    }
  }, [effectivePrintSizeIdForArea, printArea.width, printArea.height])
  const selectedProduct = product
  // Long-sleeve garments accept up to A3 on sleeves; short-sleeve garments stay
  // A6-only. Used to gate the print-size tile picker and to clamp the global
  // scpPrintSizeId when the user switches to a side with stricter limits.
  const productIsLongSleeve = useMemo(
    () => isLongSleeveGarmentProduct(selectedProduct),
    [selectedProduct]
  )
  /**
   * Hats / caps lock every print location to A6 (curved-crown garments
   * can't reliably take a larger transfer). The picker collapses to a
   * single A6 option and `printSpecs` clamps any stale override down.
   */
  const productIsHat = useMemo(
    () => isHatGarmentProduct(selectedProduct),
    [selectedProduct]
  )
  /**
   * Beanies are embroidery-only — the knit fabric can't take heat-press
   * DTF prints. When true the DecorationMethodPicker is restricted to
   * the embroidery option and every side defaults to embroidery on mount.
   */
  const productIsBeanie = useMemo(
    () => isBeanieGarmentProduct(selectedProduct),
    [selectedProduct]
  )
  /**
   * Sides the customer can print on for this product. Hats: front only —
   * the curved crown is the single realistic transfer location. Bottom-
   * half garments and accessories (pants, totes, bags, beanies, aprons,
   * towels): front + back. Everything else (tees, hoodies, longsleeves):
   * full set. Hoisted to the component body so both the embedded PDP
   * picker and the standalone /customizer rail share the same gate.
   */
  const allowedPrintSides = useMemo<GarmentSide[]>(() => {
    if (productIsHat) return ["front"]
    const productTags = getStoreProductTagValues(selectedProduct).map((t) => t.toLowerCase())
    const productTitleLower = (selectedProduct.title ?? "").toLowerCase()
    const isFrontBackOnlyProduct =
      productTags.some((t) =>
        /\b(pants?|shorts?|trousers?|jeans?|leggings?|skirts?|tote|totes|bags?|backpacks?|pouch|pouches|cap|caps|hat|hats|beanie|beanies|apron|aprons|towel|towels)\b/.test(
          t
        )
      ) ||
      /\b(tote|bag|backpack|pouch|cap|hat|beanie|apron|towel)\b/.test(productTitleLower)
    return isFrontBackOnlyProduct
      ? ["front", "back"]
      : ["front", "back", "left_sleeve", "right_sleeve", "printed_tag"]
  }, [productIsHat, selectedProduct])
  const allowedSizesForCurrentSide = useMemo(
    () =>
      getAllowedScpPrintSizesForSide(currentSide, {
        isLongSleeve: productIsLongSleeve,
        isHat: productIsHat,
      }),
    [currentSide, productIsLongSleeve, productIsHat]
  )
  /**
   * Per-side allowed sizes — fed into PricingPanel so the per-print size
   * dropdown only offers what the side physically supports (sleeves on a
   * short-sleeve tee are A6-only, hats are A6-only everywhere, etc).
   */
  const allowedSizesBySide = useMemo<
    Partial<Record<GarmentSide, ScpPrintSizeId[]>>
  >(
    () =>
      DESIGN_SIDES.reduce(
        (acc, side) => {
          acc[side] = getAllowedScpPrintSizesForSide(side, {
            isLongSleeve: productIsLongSleeve,
            isHat: productIsHat,
          })
          return acc
        },
        {} as Partial<Record<GarmentSide, ScpPrintSizeId[]>>
      ),
    [productIsLongSleeve, productIsHat]
  )

  /**
   * Manual size override entry point. The per-print row in PricingPanel
   * calls this; we mutate the ref + bump layoutVersion so `printSpecs`
   * recomputes and pricing updates on the next render.
   */
  const handleChangePrintSize = (
    objectId: string,
    sizeId: ScpPrintSizeId | null
  ) => {
    if (sizeId) {
      manualSizeOverridesRef.current.set(objectId, sizeId)
    } else {
      manualSizeOverridesRef.current.delete(objectId)
    }
    bumpLayoutVersion()
  }
  // If the current global print size isn't allowed on this side, snap it to
  // the largest allowed size so pricing + UI stay in sync.
  useEffect(() => {
    if (!allowedSizesForCurrentSide.includes(scpPrintSizeId)) {
      const fallback = allowedSizesForCurrentSide[allowedSizesForCurrentSide.length - 1]
      if (fallback) setScpPrintSizeId(fallback)
    }
  }, [allowedSizesForCurrentSide, scpPrintSizeId])
  const pdpHasVariantOptions = (selectedProduct.variants?.length ?? 0) > 1
  /**
   * When the side only allows one size (hats → A6, short-sleeve sleeves → A6,
   * printed_tag → A6), there's no decision for the customer to make on step 3
   * — but the wizard still expects an explicit "tile click" to flip
   * `pdpStep3Done` and unlock the upload panel. Without this auto-advance,
   * hat PDPs land in a stuck state where the right column shows green
   * checkmarks but the left "Add to design" panel keeps saying
   * "Customize first". Auto-advance the step so the flow continues.
   */
  useEffect(() => {
    if (!embedded) return
    if (pdpHasVariantOptions && !pdpStep1Done) return
    if (allowedSizesForCurrentSide.length !== 1) return
    if (sizingDoneSides[currentSide] && scpPrintSizeChosen) return
    setScpPrintSizeChosen(true)
    setSizingDoneSides((prev) => ({ ...prev, [currentSide]: true as const }))
    setPdpStep((s) => (s > 3 ? s : 4))
  }, [embedded, pdpHasVariantOptions, pdpStep1Done, allowedSizesForCurrentSide, pdpStep3Done, scpPrintSizeChosen])

  /**
   * Mirror of the above but for step 2 (print location). When the product
   * only allows one print location — hats are front-only — the side picker
   * has nothing to choose from. Auto-advance so the wizard doesn't dead-end
   * on a single-tile picker.
   */
  useEffect(() => {
    if (!embedded) return
    if (pdpHasVariantOptions && !pdpStep1Done) return
    if (allowedPrintSides.length !== 1) return
    if (pdpStep2Done) return
    setPdpStep2Done(true)
    setPdpStep((s) => (s > 2 ? s : 3))
  }, [embedded, pdpHasVariantOptions, pdpStep1Done, allowedPrintSides, pdpStep2Done])

  // Show a brief nudge when the customer switches to a side with no artwork yet.
  useEffect(() => {
    if (!embedded) return
    if (pdpStep < 2) return
    // decoratedSides is populated after canvas load — only nudge once the wizard
    // is past step 1 and the customer has actually switched sides.
    setShowSideNudge(!decoratedSides.includes(currentSide))
  }, [currentSide]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Beanies are embroidery-only — knit fabric can't take DTF heat-press.
   * Auto-set the active side's method to "embroidery" so the customer
   * doesn't have to click the picker, and mark it sized so the upload
   * panel + Step 3 unlock immediately. Skip if the side already has an
   * explicit method (e.g. restored from a saved design / re-order).
   */
  useEffect(() => {
    if (!productIsBeanie) return
    if (sideDecorationMethods[currentSide]) return
    setSideDecorationMethods((prev) => ({ ...prev, [currentSide]: "embroidery" }))
    setSizingDoneSides((prev) => ({ ...prev, [currentSide]: true }))
  }, [productIsBeanie, currentSide, sideDecorationMethods])
  const showPdpLabeledOptionsStep = Boolean(integratedPdpSlots) && pdpHasVariantOptions
  const embedPdpPrintStepNumber = showPdpLabeledOptionsStep ? 2 : 1
  const embedPdpQuantityStepNumber = showPdpLabeledOptionsStep ? 3 : 2
  // True once the customer has advanced past step 1 (or immediately for
  // products with no colour options). Shared with PdpLayoutGrid via the
  // CustomizeMode context so the PDP aside hides + customizer expands.
  const isCustomizing = embedded && (pdpStep > 1 || !showPdpLabeledOptionsStep)
  const customizeModeCtx = useCustomizeModeOptional()
  useEffect(() => {
    customizeModeCtx?.setIsCustomizing(isCustomizing)
  }, [isCustomizing, customizeModeCtx])
  const selectedVariant = useMemo(
    () =>
      selectedProduct?.variants?.find((variant) => variant.id === activeVariantId) ??
      selectedProduct?.variants?.[0],
    [activeVariantId, selectedProduct]
  )

  /**
   * Per-size stock state for the size matrix in <PricingPanel/>. Keyed by
   * size value, recomputed when the colour-selected variant changes (because
   * each colour has its own SKUs and therefore its own per-size stock). The
   * `requestedQuantity` per size is fed in so we can flag entries where the
   * customer is asking for more than is currently in stock, not just zero.
   */
  const stockBySize = useMemo(() => {
    if (!selectedProduct || !selectedVariant) return {}
    const variantMap = variantBySizeForReference(selectedProduct, selectedVariant)
    const requestedBySize = new Map(
      sizeMatrix.map((entry) => [entry.size, entry.quantity])
    )
    const result: Record<string, VariantStockState> = {}
    Array.from(variantMap.entries()).forEach(([size, variant]) => {
      result[size] = getVariantStockState(variant, {
        requestedQuantity: requestedBySize.get(size) ?? 0,
      })
    })
    return result
  }, [selectedProduct, selectedVariant, sizeMatrix])

  const flyImageSrcForAddToCart = useMemo(
    () => resolvePdpFlyImageSrc(selectedProduct, selectedVariant),
    [selectedProduct, selectedVariant]
  )

  // Sample the variant's front photo to get the dominant garment colour, used
  // to tint the sleeve placeholder line drawings via CSS mix-blend-mode. Falls
  // back silently to no tint if the image can't be read (e.g. CORS).
  const variantPrimaryImageUrl = useMemo(
    () => getPrimaryGarmentImageUrl(selectedProduct, selectedVariant) ?? defaultGarmentImage,
    [selectedProduct, selectedVariant, defaultGarmentImage]
  )
  const [variantTintHex, setVariantTintHex] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    setVariantTintHex(null)
    if (!variantPrimaryImageUrl) return
    sampleImageDominantColor(variantPrimaryImageUrl).then((hex) => {
      if (!cancelled) setVariantTintHex(hex)
    })
    return () => {
      cancelled = true
    }
  }, [variantPrimaryImageUrl])

  const nonSizeOptions = useMemo(
    () => (selectedProduct ? getNonSizeOptions(selectedProduct) : []),
    [selectedProduct]
  )

  const handleNonSizeOptionChange = (optionId: string, value: string) => {
    if (!selectedProduct || !selectedVariant) {
      return
    }
    const next = findVariantAfterOptionChange(selectedProduct, selectedVariant, optionId, value)
    if (next) {
      setActiveVariantId(next.id)
    }
  }

  const currencyCode =
    (selectedVariant as any)?.calculated_price?.currency_code ??
    (selectedVariant as any)?.prices?.[0]?.currency_code ??
    "usd"
  const basePriceCents = resolveVariantPrice(selectedVariant, selectedProduct)
  const bulkPricingTiers = useMemo(
    () => resolveVariantBulkPricingTiers(selectedVariant),
    [selectedVariant]
  )

  const productBrand = useMemo(() => {
    const sub = selectedProduct?.subtitle
    if (typeof sub === "string" && sub.trim()) {
      return sub.trim()
    }
    const meta = selectedProduct?.metadata as Record<string, unknown> | undefined
    const brand = meta?.brand
    if (typeof brand === "string" && brand.trim()) {
      return brand.trim()
    }
    return null
  }, [selectedProduct])

  const garmentImageUrl = useMemo(
    () =>
      getGarmentImageUrlForPrintSide(
        selectedProduct,
        selectedVariant,
        currentSide,
        defaultGarmentImage
      ),
    [selectedProduct, selectedVariant, currentSide, defaultGarmentImage]
  )

  const garmentDisplayTitle = selectedProduct?.title ?? defaultGarmentTitle

  const decoratedSides = useMemo(
    () => DESIGN_SIDES.filter((side) => (sideLayoutsRef.current[side] ?? []).length > 0),
    [layoutVersion]
  )
  const decoratedSidesCount = decoratedSides.length
  const totalQty = sizeMatrix.reduce((total, entry) => total + entry.quantity, 0)

  /**
   * One PrintSpec per top-level Fabric object — the canonical input to the
   * per-print pricing path. Derives bounding-box → cm → snapped size tier
   * for each object, honouring any per-object manual overrides the
   * customer has set. Re-runs whenever the canvas changes (`layoutVersion`)
   * or the canvas size / product changes.
   *
   * Falls back to an empty array when the canvas is too small to convert
   * pixels to cm reliably; pricing then uses the legacy side-level path.
   */
  const printSpecs = useMemo<PrintSpec[]>(() => {
    const canvasW = Math.round(canvasSize.width)
    const canvasH = Math.round(canvasSize.height)
    if (canvasW < MIN_PRINT_AREA_PX || canvasH < MIN_PRINT_AREA_PX) {
      return []
    }
    const longSleeve = isLongSleeveGarmentProduct(selectedProduct)
    const hat = isHatGarmentProduct(selectedProduct)
    const out: PrintSpec[] = []
    DESIGN_SIDES.forEach((side) => {
      const objects = sideLayoutsRef.current[side] ?? []
      objects.forEach((raw) => {
        const obj = raw as Record<string, any>
        const objectId =
          typeof obj.customizerId === "string" && obj.customizerId.length > 0
            ? (obj.customizerId as string)
            : null
        if (!objectId) return
        const baseW = Number(obj.width)
        const baseH = Number(obj.height)
        const scaleX = Number(obj.scaleX ?? 1)
        const scaleY = Number(obj.scaleY ?? 1)
        if (!Number.isFinite(baseW) || !Number.isFinite(baseH)) return
        const renderedW = Math.max(0, baseW * (Number.isFinite(scaleX) ? scaleX : 1))
        const renderedH = Math.max(0, baseH * (Number.isFinite(scaleY) ? scaleY : 1))
        const approxCm = canvasPxToApproxCm(renderedW, renderedH, canvasW, canvasH)
        const manual = manualSizeOverridesRef.current.get(objectId)
        const sizeId =
          manual ??
          snapSizeForBoundingCm(side, approxCm, {
            isLongSleeve: longSleeve,
            isHat: hat,
          })
        // Hats clamp every side to A6 even when a stale manual override
        // says otherwise — same shape as the printed_tag clamp below.
        const clampedSize = hat || SCP_A6_ONLY_SIDES.has(side) ? "up_to_a6" : sizeId
        out.push({
          objectId,
          side,
          sizeId: clampedSize,
          manualSize: !!manual,
          approxCm: {
            width: Math.round(approxCm.width * 10) / 10,
            height: Math.round(approxCm.height * 10) / 10,
          },
        })
      })
    })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutVersion, canvasSize.width, canvasSize.height, selectedProduct?.id])

  const pricing = calculatePricing({
    basePriceCents,
    decoratedSidesCount,
    decoratedSides,
    totalQuantity: totalQty,
    bulkPricingTiers,
    scpPrint: { printSizeId: scpPrintSizeId },
    prints: printSpecs.length > 0 ? printSpecsToPricingSpecs(printSpecs) : undefined,
  })

  const updateLayers = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return
    }

    const nextLayers = [...canvas.getObjects()]
      .reverse()
      .map((object: any, index) => ({
        id: getObjectId(object),
        label: object.customizerLabel || object.type || `Layer ${index + 1}`,
        visible: object.visible !== false,
        locked: !!object.lockMovementX,
        type: typeof object.type === "string" ? object.type : undefined,
      }))

    setLayers(nextLayers)

    const active = canvas.getActiveObject()
    setSelectedLayerId(active ? getObjectId(active) : null)
  }

  const bumpLayoutVersion = () => {
    setLayoutVersion((version) => version + 1)
  }

  const clampObjectToBounds = (object: any) => {
    const canvas = fabricCanvasRef.current
    if (!canvas || !object) {
      return
    }

    const pr = printArea
    if (pr.width < MIN_PRINT_AREA_PX || pr.height < MIN_PRINT_AREA_PX) {
      setOutOfBoundsWarning(null)
      return
    }

    object.setCoords()
    // Fabric 7: axis-aligned scene bbox (extra args are ignored; do not pass legacy Fabric 5 flags).
    const bounds = object.getBoundingRect()
    const prevLeft = object.left ?? 0
    const prevTop = object.top ?? 0

    const inside =
      bounds.left >= pr.x - PRINT_AREA_EPS &&
      bounds.top >= pr.y - PRINT_AREA_EPS &&
      bounds.left + bounds.width <= pr.x + pr.width + PRINT_AREA_EPS &&
      bounds.top + bounds.height <= pr.y + pr.height + PRINT_AREA_EPS

    if (inside) {
      setOutOfBoundsWarning(null)
      return
    }

    let desiredLeft = bounds.left
    let desiredTop = bounds.top

    const right = pr.x + pr.width
    const bottom = pr.y + pr.height

    // Horizontal: if art is wider than the print box, slide along [printRight - width, printLeft] so it stays overlapping.
    if (bounds.width > pr.width + PRINT_AREA_EPS) {
      const minLeft = right - bounds.width
      const maxLeft = pr.x
      desiredLeft = Math.min(Math.max(bounds.left, minLeft), maxLeft)
    } else {
      if (bounds.left < pr.x - PRINT_AREA_EPS) {
        desiredLeft = pr.x
      } else if (bounds.left + bounds.width > right + PRINT_AREA_EPS) {
        desiredLeft = right - bounds.width
      }
    }

    if (bounds.height > pr.height + PRINT_AREA_EPS) {
      const minTop = bottom - bounds.height
      const maxTop = pr.y
      desiredTop = Math.min(Math.max(bounds.top, minTop), maxTop)
    } else {
      if (bounds.top < pr.y - PRINT_AREA_EPS) {
        desiredTop = pr.y
      } else if (bounds.top + bounds.height > bottom + PRINT_AREA_EPS) {
        desiredTop = bottom - bounds.height
      }
    }

    const dx = desiredLeft - bounds.left
    const dy = desiredTop - bounds.top
    const nextLeft = prevLeft + dx
    const nextTop = prevTop + dy

    object.set({ left: nextLeft, top: nextTop })
    object.setCoords()
    canvas.renderAll()

    const moved =
      Math.abs(dx) > PRINT_AREA_EPS || Math.abs(dy) > PRINT_AREA_EPS

    setOutOfBoundsWarning(
      moved ? "Artwork was nudged to stay inside the print area." : null
    )
  }

  const updateDpiWarning = () => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      setDpiWarning(null)
      setDpiAssessment({ worstDpi: null, severity: "ok", imagesEvaluated: 0, imagesBelowCritical: 0 })
      return
    }
    if (printArea.width < 1 || printArea.height < 1) {
      setDpiWarning(null)
      setDpiAssessment({ worstDpi: null, severity: "ok", imagesEvaluated: 0, imagesBelowCritical: 0 })
      return
    }

    const pixelsPerInch = printArea.width / PRINT_AREA_INCHES.width
    if (!Number.isFinite(pixelsPerInch) || pixelsPerInch <= 0) {
      setDpiWarning(null)
      setDpiAssessment({ worstDpi: null, severity: "ok", imagesEvaluated: 0, imagesBelowCritical: 0 })
      return
    }

    // Inline warning prefers the active object (what the user is touching);
    // canvas-wide assessment drives the modal so unselected low-res layers
    // can't sneak through.
    const active = canvas.getActiveObject?.()
    const activeDpi =
      active && active.type === "image"
        ? effectiveDpiForFabricImage(active, pixelsPerInch)
        : null

    if (activeDpi !== null && activeDpi < DPI_CRITICAL_THRESHOLD) {
      setDpiWarning(
        `Low resolution warning: estimated ${Math.max(1, Math.round(activeDpi))} DPI at current size.`
      )
    } else {
      setDpiWarning(null)
    }

    const assessment = assessCanvasDpi(canvas, pixelsPerInch)
    setDpiAssessment(assessment)

    // Auto-open the modal the first time the canvas crosses into "critical"
    // territory. Stays closed once dismissed; the customer can re-trigger by
    // re-uploading a worse file (assessment changes again).
    if (
      assessment.severity === "critical" &&
      !lowResModalDismissedRef.current &&
      !vectorizationRequested
    ) {
      setLowResModalOpen(true)
    }
  }

  // Edit-from-cart hydration: when `?edit=<lineItemId>` is present, fetch the
  // cart and pre-populate sizes / notes / print size / variant from the line's
  // saved metadata. Artwork itself is not persisted on the cart line (Medusa
  // size limits) so the customer re-uploads — we surface which sides previously
  // had artwork so it's clear what to recreate.
  useEffect(() => {
    if (!editLineItemId || editingHydrated) {
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const cart = await retrieveCart()
        if (cancelled || !cart?.items) return
        const line = cart.items.find((i) => i.id === editLineItemId)
        if (!line) {
          setEditLineItemId(null)
          return
        }
        const meta = (line.metadata ?? {}) as { customizerDesign?: CustomizerMetadata }
        const design = meta.customizerDesign
        if (design && Array.isArray(design.sizes) && design.sizes.length > 0) {
          setSizeMatrix(design.sizes)
        }
        if (design?.printNotes) {
          setPrintNotes(design.printNotes)
        }
        if (design?.scpPrintSizeId) {
          const sid = design.scpPrintSizeId
          if (
            sid === "up_to_a6" ||
            sid === "up_to_a4" ||
            sid === "up_to_a3" ||
            sid === "oversize"
          ) {
            setScpPrintSizeId(sid as ScpPrintSizeId)
            setScpPrintSizeChosen(true)
          }
        }
        const previousSides = (design?.artifacts ?? [])
          .map((a) => a.side)
          .filter((s, i, arr) => arr.indexOf(s) === i)
        setEditingPreviousSides(previousSides as GarmentSide[])
        setEditingPreviousQty(line.quantity ?? 0)
        setEditingProductTitle(line.product_title ?? line.title ?? null)
        // Drop user straight onto the final step so they can update qty / re-upload.
        setPdpStep1Done(true)
        setPdpStep2Done(true)
        setSizingDoneSides(
          Object.fromEntries((previousSides as GarmentSide[]).map((s) => [s, true as const])) as Partial<Record<GarmentSide, true>>
        )
        setPdpStep(4)
        setEditingHydrated(true)
      } catch {
        // Cart unreachable; degrade silently — user can still create a fresh line.
        setEditLineItemId(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [editLineItemId, editingHydrated])

  // Stage 1 of rehydration: fetch the saved metadata from either source.
  useEffect(() => {
    if (hydrationApplied || pendingHydration) return
    if (!designIdFromUrl && !reorderRefFromUrl) return
    let cancelled = false
    ;(async () => {
      try {
        let meta: CustomizerMetadata | null = null
        if (designIdFromUrl) {
          const design = await getMyDesign(designIdFromUrl)
          meta = (design?.customizer_metadata as CustomizerMetadata | undefined) ?? null
        } else if (reorderRefFromUrl) {
          const [orderId, lineItemId] = reorderRefFromUrl.split(":")
          if (orderId && lineItemId) {
            meta = await getOrderLineCustomizerMetadata(orderId, lineItemId)
          }
        }
        if (cancelled) return
        if (meta) setPendingHydration(meta)
      } catch {
        // Best-effort; user can still build a fresh design.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [designIdFromUrl, reorderRefFromUrl, hydrationApplied, pendingHydration])

  // Stage 2 of rehydration: replay the metadata once Fabric is up. canvasSize
  // is the readiness signal (set by syncSize() inside the canvas init effect).
  useEffect(() => {
    if (!pendingHydration || hydrationApplied) return
    const canvas = fabricCanvasRef.current
    if (!canvas || canvasSize.width <= 0 || canvasSize.height <= 0) return

    if (Array.isArray(pendingHydration.sideLayouts)) {
      for (const sl of pendingHydration.sideLayouts) {
        if (sl?.side && Array.isArray(sl.objects)) {
          sideLayoutsRef.current[sl.side] = sl.objects
        }
      }
    }
    if (Array.isArray(pendingHydration.sizes) && pendingHydration.sizes.length > 0) {
      setSizeMatrix(pendingHydration.sizes)
    }
    if (typeof pendingHydration.printNotes === "string" && pendingHydration.printNotes.length) {
      setPrintNotes(pendingHydration.printNotes)
    }
    if (pendingHydration.scpPrintSizeId) {
      const sid = pendingHydration.scpPrintSizeId
      if (sid === "up_to_a6" || sid === "up_to_a4" || sid === "up_to_a3" || sid === "oversize") {
        setScpPrintSizeId(sid as ScpPrintSizeId)
        setScpPrintSizeChosen(true)
        // Mark all sides as sized so the wizard doesn't re-prompt for print
        // size when re-opening a previously saved/ordered design.
        setSizingDoneSides({ front: true, back: true, left_sleeve: true, right_sleeve: true, printed_tag: true })
      }
    }
    if (pendingHydration.variantId) {
      const variantExists = product.variants?.some((v) => v.id === pendingHydration.variantId)
      if (variantExists) setActiveVariantId(pendingHydration.variantId)
    }

    // Restore per-side decoration methods (v3 schema). v2 metadata has no
    // entries so all sides default to "print" via getSideDecorationMethod()
    // — no explicit restore needed in that case.
    if (pendingHydration.sideDecorationMethods) {
      setSideDecorationMethods(pendingHydration.sideDecorationMethods)
    }
    if (pendingHydration.sideEmbroideryConfigs) {
      setSideEmbroideryConfigs(pendingHydration.sideEmbroideryConfigs)
    }

    // Restore manual size overrides so a re-edit of a saved/ordered design
    // keeps the prices the customer last saw. Auto-snapped prints carry
    // `manualSize: false` and we leave them out of the override map so the
    // bounding-box math drives them again on first render.
    if (Array.isArray(pendingHydration.prints)) {
      manualSizeOverridesRef.current.clear()
      for (const print of pendingHydration.prints) {
        if (
          print &&
          typeof print.objectId === "string" &&
          print.objectId.length > 0 &&
          print.manualSize === true &&
          (print.sizeId === "up_to_a6" ||
            print.sizeId === "up_to_a4" ||
            print.sizeId === "up_to_a3" ||
            print.sizeId === "oversize")
        ) {
          manualSizeOverridesRef.current.set(print.objectId, print.sizeId)
        }
      }
    }

    // Restore the side the customer was viewing when they saved / placed the
    // order. Without this, re-opening a back-of-hoodie design dumps the user
    // onto the front and they have to hunt for their work.
    let sideToLoad: GarmentSide = currentSideRef.current
    const savedSide = pendingHydration.activeSide
    if (
      savedSide === "front" ||
      savedSide === "back" ||
      savedSide === "left_sleeve" ||
      savedSide === "right_sleeve" ||
      savedSide === "printed_tag"
    ) {
      sideToLoad = savedSide
      // Update the ref synchronously so the loadSide call below reads the
      // new value before React commits the setCurrentSide state update.
      currentSideRef.current = savedSide
      setCurrentSide(savedSide)
    }

    void loadSide(sideToLoad)
    setHydrationApplied(true)
  }, [pendingHydration, hydrationApplied, canvasSize.width, canvasSize.height, product.variants])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    try {
      const raw = window.sessionStorage.getItem(SESSION_UPLOADS_KEY)
      if (!raw) {
        return
      }
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        return
      }
      const hydrated = parsed
        .filter((entry) => entry && typeof entry === "object")
        .map((entry) => ({
          id: String((entry as any).id ?? ""),
          name: String((entry as any).name ?? "Upload"),
          type: String((entry as any).type ?? "image/png"),
          dataUrl: String((entry as any).dataUrl ?? ""),
          originalStorageUrl:
            typeof (entry as any).originalStorageUrl === "string"
              ? (entry as any).originalStorageUrl
              : undefined,
        }))
        .filter((entry) => entry.id && entry.dataUrl)
      setSessionUploads(hydrated)
    } catch {
      // Ignore invalid persisted uploads and continue with an empty tray.
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    try {
      window.sessionStorage.setItem(SESSION_UPLOADS_KEY, JSON.stringify(sessionUploads))
    } catch {
      // Ignore persistence errors; tray still works in-memory.
    }
  }, [sessionUploads])

  const saveCurrentSide = () => {
    if (suppressFabricPersistenceRef.current) {
      return
    }
    // Throttled inside the helper so this is safe to call on every
    // mutation. Tracks customizer iteration depth.
    trackCustomizerAction("layout_change", { side: currentSideRef.current })
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return
    }

    const serialized = canvas.toJSON([
      "customizerId",
      "customizerLabel",
      "sourceWidthPx",
      "sourceHeightPx",
      // Tag attached on add — links a canvas object back to the upload it
      // came from so the cart-add flow only attaches the customer-original
      // files actually referenced on the canvas (not stale items from the
      // persistent "My uploads" tray).
      "customizerUploadId",
    ])
    sideLayoutsRef.current[currentSideRef.current] = (serialized.objects ?? []) as Record<
      string,
      unknown
    >[]
    bumpLayoutVersion()
  }

  const loadSide = async (side: GarmentSide) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return
    }
    suppressFabricPersistenceRef.current = true
    try {
      const loadVersion = ++sideLoadVersionRef.current

      canvas.clear()
      const objects = sideLayoutsRef.current[side] ?? []
      const json = {
        version: "7.0.0",
        objects,
      }
      await (canvas as any).loadFromJSON(json)
      if (loadVersion !== sideLoadVersionRef.current) {
        return
      }
      canvas.getObjects().forEach((object: any) => {
        getObjectId(object)
      })
      canvas.renderAll()
      updateLayers()
      updateDpiWarning()
      bumpLayoutVersion()
    } finally {
      suppressFabricPersistenceRef.current = false
    }
  }

  useEffect(() => {
    if (!selectedProduct?.id) {
      return
    }

    const variantIds = new Set(selectedProduct.variants?.map((v) => v.id) ?? [])

    const preferredId =
      embedded &&
      pdpSyncedVariantId &&
      variantIds.has(pdpSyncedVariantId)
        ? pdpSyncedVariantId
        : activeVariantId

    const refVariant =
      selectedProduct.variants?.find((v) => v.id === preferredId) ??
      selectedProduct.variants?.[0]
    if (!refVariant) {
      setSizeMatrix([])
      return
    }

    if (refVariant.id !== activeVariantId) {
      setActiveVariantId(refVariant.id)
      return
    }

    const productChanged = lastCustomizerProductIdRef.current !== selectedProduct.id
    lastCustomizerProductIdRef.current = selectedProduct.id

    const next = uniqueSizesForVariant(selectedProduct, refVariant)

    setSizeMatrix((prev) => {
      if (embedded && productOptionsFromPdp) {
        return next.map((row) => ({
          size: row.size,
          quantity: productOptionsFromPdp.sizeQuantities[row.size] ?? 0,
        }))
      }
      if (productChanged) {
        return next.map((row) => ({ ...row }))
      }
      const prevMap = new Map(prev.map((entry) => [entry.size, entry.quantity]))
      return next.map((row) => ({
        size: row.size,
        quantity: prevMap.get(row.size) ?? 0,
      }))
    })
  }, [
    selectedProduct,
    activeVariantId,
    embedded,
    pdpSyncedVariantId,
    productOptionsFromPdp?.sizeQuantities,
  ])

  useEffect(() => {
    const htmlCanvas = htmlCanvasRef.current
    if (!htmlCanvas) {
      return
    }

    const resizeTarget = fabricContainerRef.current ?? htmlCanvas.parentElement
    if (!resizeTarget) {
      return
    }

    const canvas = new (fabric as any).Canvas(htmlCanvas, {
      preserveObjectStacking: true,
      selection: true,
    })
    fabricCanvasRef.current = canvas

    const syncSize = () => {
      const width = resizeTarget.clientWidth
      const height = resizeTarget.clientHeight
      canvas.setDimensions({ width, height })
      setCanvasSize({ width, height })
    }

    const syncHandlers = () => {
      updateLayers()
      updateDpiWarning()
      saveCurrentSide()
      setShowSideNudge(false)
    }

    syncSize()

    canvas.on("object:moving", (event: any) => {
      setShowPrintAreaGuides(true)
      clampObjectToBounds(event.target)
    })
    canvas.on("object:scaling", (event: any) => {
      setShowPrintAreaGuides(true)
      // Cap the artwork size at the current print area (per-side, per-size).
      // Skipped when the effective print size is "oversize" (no max).
      const obj = event.target
      const pr = printAreaRef.current
      if (
        obj &&
        pr &&
        effectivePrintSizeIdRef.current !== "oversize" &&
        pr.width >= MIN_PRINT_AREA_PX &&
        pr.height >= MIN_PRINT_AREA_PX
      ) {
        // Use the object's intrinsic width/height (constant during scaling) so
        // we compute a stable max-scale rather than relying on the live
        // bounding rect (which Fabric may not have committed yet mid-drag).
        const baseW = Math.max(1, obj.width ?? 0)
        const baseH = Math.max(1, obj.height ?? 0)
        const maxScaleX = pr.width / baseW
        const maxScaleY = pr.height / baseH
        const maxScale = Math.min(maxScaleX, maxScaleY)
        const sx = Math.abs(obj.scaleX ?? 1)
        const sy = Math.abs(obj.scaleY ?? 1)
        const overshoot = Math.max(sx, sy) > maxScale
        if (overshoot && Number.isFinite(maxScale) && maxScale > 0) {
          const sign = (v: number) => (v < 0 ? -1 : 1)
          obj.set({
            scaleX: maxScale * sign(obj.scaleX ?? 1),
            scaleY: maxScale * sign(obj.scaleY ?? 1),
          })
          obj.setCoords?.()
          canvas.requestRenderAll?.()
        }
      }
      clampObjectToBounds(event.target)
    })
    canvas.on("object:rotating", (event: any) => {
      setShowPrintAreaGuides(true)
      clampObjectToBounds(event.target)
    })
    canvas.on("object:modified", syncHandlers)
    canvas.on("object:added", syncHandlers)
    canvas.on("object:removed", syncHandlers)
    canvas.on("selection:created", () => {
      setShowPrintAreaGuides(true)
      updateLayers()
    })
    canvas.on("selection:updated", () => {
      setShowPrintAreaGuides(true)
      updateLayers()
    })
    canvas.on("selection:cleared", () => {
      setShowPrintAreaGuides(false)
      updateLayers()
    })

    const observer = new ResizeObserver(syncSize)
    observer.observe(resizeTarget)

    return () => {
      observer.disconnect()
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [])

  const switchSide = async (nextSide: GarmentSide) => {
    if (nextSide === currentSide) {
      return
    }

    saveCurrentSide()
    setShowPrintAreaGuides(false)
    setCurrentSide(nextSide)
    await loadSide(nextSide)
  }

  const addCanvasObject = (object: any) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return
    }

    // Per-side cap. Each top-level object becomes one transfer in
    // production, so leaving this unbounded creates orders the print room
    // can't realistically fulfil. Hats are tighter — only one print on the
    // crown is realistic — so they get their own lower cap.
    const perSideCap = productIsHat ? MAX_PRINTS_PER_SIDE_HAT : MAX_PRINTS_PER_SIDE
    const currentCount = canvas.getObjects().length
    if (currentCount >= perSideCap) {
      setUploadError(
        productIsHat
          ? "Hats only support one print on the front. Remove the existing print to add a different one."
          : `Up to ${perSideCap} prints per location. Remove one before adding another.`
      )
      return
    }

    getObjectId(object)
    object.set({
      left: printArea.x + printArea.width / 2 - (object.getScaledWidth?.() ?? 80) / 2,
      top: printArea.y + printArea.height / 2 - (object.getScaledHeight?.() ?? 40) / 2,
    })
    canvas.add(object)
    canvas.setActiveObject(object)
    clampObjectToBounds(object)
    canvas.renderAll()
    updateLayers()
    saveCurrentSide()
  }

  const addUploadedAssetToCanvas = async (asset: {
    name: string
    type: string
    dataUrl?: string
    svgText?: string
    /**
     * Persistent id from the "My uploads" tray. Stamped onto the resulting
     * canvas object so the cart-add flow can resolve which uploads are
     * actually referenced on this design (vs stale items in the tray from
     * earlier sessions / orders).
     */
    uploadId?: string
  }) => {
    if (asset.type === "image/svg+xml") {
      const svg = asset.svgText ?? ""
      if (!svg) {
        throw new Error("Could not read SVG.")
      }
      const svgObject = await loadSvgObject(svg)
      svgObject.set({
        customizerLabel: asset.name || "SVG",
        sourceWidthPx: Number(svgObject.width ?? 0),
        ...(asset.uploadId ? { customizerUploadId: asset.uploadId } : {}),
      })
      if (effectivePrintSizeIdForArea === "oversize") {
        svgObject.scaleToWidth?.(getTargetArtworkWidth(printArea.width))
      } else {
        fitObjectToPrintArea(svgObject as any, printArea)
      }
      addCanvasObject(svgObject)
      return
    }

    const dataUrl = asset.dataUrl ?? ""
    if (!dataUrl) {
      throw new Error("Could not read image.")
    }
    const imageObject = await FabricImage.fromURL(dataUrl)
    const { width: naturalW, height: naturalH } = imageObject.getOriginalSize()
    if (naturalW > 0 && naturalH > 0) {
      imageObject.set({ width: naturalW, height: naturalH, scaleX: 1, scaleY: 1 })
    }
    imageObject.set({
      customizerLabel: asset.name || "Image",
      sourceWidthPx: getFabricImageSourceWidthPx(imageObject),
      sourceHeightPx: getFabricImageSourceHeightPx(imageObject),
      ...(asset.uploadId ? { customizerUploadId: asset.uploadId } : {}),
    })
    if (effectivePrintSizeIdForArea === "oversize") {
      imageObject.scaleToWidth?.(getTargetArtworkWidth(printArea.width))
    } else {
      fitObjectToPrintArea(imageObject as any, printArea)
    }
    addCanvasObject(imageObject)
  }

  const fireDesignStarted = (source: string) => {
    if (designStartedFiredRef.current) return
    designStartedFiredRef.current = true
    const productId = selectedProduct?.id ?? null
    const variantId = selectedVariant?.id ?? null
    const payload = { source, product_id: productId, variant_id: variantId }
    trackCustomizerFunnel("design_started", payload)
    phCapture("customizer_design_started", payload)
  }

  /**
   * Walk every decorated side's serialised layout and collect the set of
   * `customizerUploadId` values referenced. Used to filter the persistent
   * "My uploads" tray down to only those uploads actually placed on the
   * current design — without it, every cart-add or "save to my designs"
   * also attached unrelated images from earlier sessions, which then
   * showed up as confusing "Customer upload" downloads on the admin
   * order page.
   */
  const collectReferencedUploadIds = (): Set<string> => {
    const seen = new Set<string>()
    DESIGN_SIDES.forEach((side) => {
      const objects = sideLayoutsRef.current[side] ?? []
      objects.forEach((raw) => {
        const id = (raw as Record<string, unknown>).customizerUploadId
        if (typeof id === "string" && id.length > 0) {
          seen.add(id)
        }
      })
    })
    return seen
  }

  const handleUploadFile = async (file: File) => {
    const isAllowedType =
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.type === "image/svg+xml"

    if (!isAllowedType) {
      setUploadError("Please upload PNG, JPG, or SVG.")
      return
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      setUploadError("File is too large. Maximum size is 8MB.")
      return
    }

    // iOS Safari occasionally fires the file-input `change` event twice
    // for the same selection — same name, size, and lastModified. Without
    // a dedupe the customer ends up with two stacked copies of their
    // artwork on the canvas. Track the most recent upload signature in a
    // ref and ignore any duplicate that arrives within 1500ms.
    const sig = `${file.name}|${file.size}|${file.lastModified}`
    const now = Date.now()
    const last = lastUploadSignatureRef.current
    if (last && last.sig === sig && now - last.at < 1500) {
      // Drop silent — re-firing the same event isn't an error condition
      // and the customer doesn't need to know about it.
      return
    }
    lastUploadSignatureRef.current = { sig, at: now }

    setUploadError(null)
    fireDesignStarted("upload")
    try {
      if (file.type === "image/svg+xml") {
        const originalPromise = uploadCustomerOriginalUnchanged(file)
        const svg = await readFileAsText(file)
        const originalStorageUrl = await originalPromise
        const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
        const nextAsset: SessionUploadAsset = {
          id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: file.name || "SVG",
          type: file.type,
          dataUrl,
          ...(originalStorageUrl ? { originalStorageUrl } : {}),
        }
        setSessionUploads((current) => [nextAsset, ...current.filter((entry) => entry.dataUrl !== dataUrl)])
        await addUploadedAssetToCanvas({
          name: nextAsset.name,
          type: nextAsset.type,
          svgText: svg,
          uploadId: nextAsset.id,
        })
        return
      }

      // Archive the original file (with EXIF intact) to MinIO for the
      // production team's reference, but use an EXIF-normalised copy
      // for the canvas + print render so what-you-see-is-what-gets-printed.
      const originalPromise = uploadCustomerOriginalUnchanged(file)
      const rawDataUrl = await readFileAsDataUrl(file)
      const dataUrl = await normalizeRasterDataUrl(file, rawDataUrl)
      const originalStorageUrl = await originalPromise
      const nextAsset: SessionUploadAsset = {
        id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: file.name || "Image",
        // Normalisation re-encodes to PNG, so the type stored alongside
        // the canvas-bound data URL must match. The MinIO archive still
        // has the original MIME (handled by `uploadCustomerOriginalUnchanged`).
        type: dataUrl.startsWith("data:image/png") ? "image/png" : file.type,
        dataUrl,
        ...(originalStorageUrl ? { originalStorageUrl } : {}),
      }
      setSessionUploads((current) => [nextAsset, ...current.filter((entry) => entry.dataUrl !== dataUrl)])
      await addUploadedAssetToCanvas({
        name: nextAsset.name,
        type: nextAsset.type,
        dataUrl,
        uploadId: nextAsset.id,
      })
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not upload image.")
    }
  }

  /**
   * "From your cart" tile click — fetch the artwork from MinIO, wrap it as
   * a File, and run it through the standard upload pipeline. Reusing
   * `handleUploadFile` means we get the same dedupe/normalisation/MinIO
   * archive/canvas-add path as a fresh upload, so the artwork lands in
   * `sessionUploads` and behaves identically afterwards. The trade-off
   * is one extra MinIO write per reuse — fine for a manual customer
   * action.
   */
  const handleAddCartDesignFromCart = async (design: {
    id: string
    name: string
    url: string
  }) => {
    setUploadError(null)
    try {
      const response = await fetch(design.url, { mode: "cors" })
      if (!response.ok) {
        throw new Error(`Could not fetch artwork (HTTP ${response.status})`)
      }
      const blob = await response.blob()
      // Infer a usable filename from the URL (strip query string + path).
      const urlPath = (() => {
        try {
          return new URL(design.url).pathname
        } catch {
          return design.url
        }
      })()
      const inferredName =
        urlPath.split("/").pop() || design.name || "cart-artwork"
      const file = new File([blob], inferredName, {
        type: blob.type || "image/png",
      })
      await handleUploadFile(file)
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Could not add that artwork from your cart."
      )
    }
  }

  const handleReuseUpload = async (uploadId: string) => {
    const asset = sessionUploads.find((entry) => entry.id === uploadId)
    if (!asset) {
      setUploadError("That upload is no longer available.")
      return
    }

    setUploadError(null)
    fireDesignStarted("reuse_upload")
    try {
      if (asset.type === "image/svg+xml") {
        const prefix = "data:image/svg+xml;charset=utf-8,"
        const encoded = asset.dataUrl.startsWith(prefix) ? asset.dataUrl.slice(prefix.length) : ""
        const svgText = encoded ? decodeURIComponent(encoded) : ""
        await addUploadedAssetToCanvas({
          name: asset.name,
          type: asset.type,
          svgText,
          uploadId: asset.id,
        })
        return
      }
      await addUploadedAssetToCanvas({
        name: asset.name,
        type: asset.type,
        dataUrl: asset.dataUrl,
        uploadId: asset.id,
      })
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not reuse uploaded image.")
    }
  }

  const handleAddText = (input: {
    text: string
    color: string
    fontFamily: string
    letterSpacing: number
  }) => {
    fireDesignStarted("add_text")
    const textObject = new (fabric as any).IText(input.text || "Text", {
      fontFamily: input.fontFamily || "Arial",
      fill: input.color,
      charSpacing: input.letterSpacing,
      fontSize: 42,
      customizerLabel: "Text",
    })
    addCanvasObject(textObject)
  }

  const handleAddCurvedText = (input: { text: string; color: string; radius: number }) => {
    const path = new (fabric as any).Path(
      `M 0 ${input.radius} A ${input.radius} ${input.radius} 0 0 1 ${input.radius * 2} ${input.radius}`
    )
    const textObject = new (fabric as any).Text(input.text || "Curved Text", {
      fill: input.color,
      fontSize: 32,
      path,
      customizerLabel: "Curved Text",
    })
    addCanvasObject(textObject)
  }

  const removeSelectedImage = () => {
    const canvas = fabricCanvasRef.current
    const active = canvas?.getActiveObject?.()
    // Any selectable, non-locked object the customer placed counts —
    // raster images load as `image`, SVG uploads as `group`, text as
    // `i-text`. Previously the gate only matched `image`, so removing
    // an SVG logo or a text layer silently no-op'd.
    if (!active) {
      setUploadError("Select a layer to remove first.")
      return
    }
    if (active.lockMovementX || active.lockMovementY) {
      setUploadError("That layer is locked. Unlock it first, then remove.")
      return
    }

    canvas.remove(active)
    canvas.discardActiveObject()
    canvas.renderAll()
    updateLayers()
    saveCurrentSide()
    setUploadError(null)
  }

  const canRemoveImage = useMemo(() => {
    // Same relaxation — enable Remove for any selected, non-locked
    // top-level layer (image / svg-group / text). Locked layers stay
    // disabled because the explicit lock should prevent accidental
    // removal too.
    const layer = layers.find((l) => l.id === selectedLayerId)
    if (!layer) return false
    return !layer.locked
  }, [layers, selectedLayerId])

  const selectLayer = (id: string) => {
    const canvas = fabricCanvasRef.current
    const object = canvas?.getObjects().find((entry: any) => getObjectId(entry) === id)
    if (!object) {
      return
    }
    canvas.setActiveObject(object)
    canvas.renderAll()
    updateLayers()
  }

  const toggleLayerVisibility = (id: string) => {
    const canvas = fabricCanvasRef.current
    const object = canvas?.getObjects().find((entry: any) => getObjectId(entry) === id)
    if (!object) {
      return
    }
    object.set({ visible: object.visible === false })
    canvas.renderAll()
    updateLayers()
    saveCurrentSide()
  }

  const toggleLayerLock = (id: string) => {
    const canvas = fabricCanvasRef.current
    const object = canvas?.getObjects().find((entry: any) => getObjectId(entry) === id)
    if (!object) {
      return
    }
    const nextLocked = !object.lockMovementX
    object.set({
      lockMovementX: nextLocked,
      lockMovementY: nextLocked,
      lockScalingX: nextLocked,
      lockScalingY: nextLocked,
      lockRotation: nextLocked,
    })
    updateLayers()
    saveCurrentSide()
  }

  const alignSelection = (mode: "centerX" | "centerY" | "top" | "middle" | "bottom") => {
    const canvas = fabricCanvasRef.current
    const object = canvas?.getActiveObject()
    if (!object) {
      return
    }

    const width = object.getScaledWidth?.() ?? 0
    const height = object.getScaledHeight?.() ?? 0
    const updates: Record<string, number> = {}

    if (mode === "centerX") {
      updates.left = printArea.x + printArea.width / 2 - width / 2
    }
    if (mode === "centerY" || mode === "middle") {
      updates.top = printArea.y + printArea.height / 2 - height / 2
    }
    if (mode === "top") {
      updates.top = printArea.y
    }
    if (mode === "bottom") {
      updates.top = printArea.y + printArea.height - height
    }

    object.set(updates)
    clampObjectToBounds(object)
    saveCurrentSide()
  }

  const recolorSelectedSvg = (nextColor: string) => {
    const canvas = fabricCanvasRef.current
    const object = canvas?.getActiveObject()
    if (!object) {
      return
    }

    const updateColor = (target: any) => {
      if (typeof target.set === "function") {
        if (target.fill) {
          target.set("fill", nextColor)
        }
        if (target.stroke) {
          target.set("stroke", nextColor)
        }
      }

      if (Array.isArray(target._objects)) {
        target._objects.forEach((child: any) => updateColor(child))
      }
    }

    updateColor(object)
    canvas.renderAll()
    saveCurrentSide()
  }

  const changeSizeQuantity = (size: string, quantity: number) => {
    const safeQty = Math.max(0, Math.floor(Number.isFinite(quantity) ? quantity : 0))
    setSizeMatrix((current) =>
      current.map((entry) =>
        entry.size === size ? { ...entry, quantity: safeQty } : entry
      )
    )
    if (productOptionsFromPdp) {
      productOptionsFromPdp.setSizeQuantity(size, safeQty)
      const sizeOption = getSizeOption(selectedProduct)
      const sizeTitle = sizeOption?.title
      if (sizeTitle) {
        productOptionsFromPdp.setOptionValue(sizeTitle, size)
      }
    }
  }

  const renderSideArtifacts = async (
    side: GarmentSide,
    sideObjects: Record<string, unknown>[],
    mockupGarmentUrl: string | null,
    canvasDims: { width: number; height: number }
  ): Promise<{ printUrl: string | null; mockupUrl: string | null }> => {
    /**
     * Full-canvas export (same coordinate space as the live editor). The backend crops the
     * print rectangle and trims transparent margins for the PNG; mockup uses the same crop
     * plus object-cover garment alignment.
     */
    const staticCanvas = new (fabric as any).StaticCanvas(null, {
      width: Math.round(canvasDims.width),
      height: Math.round(canvasDims.height),
    })
    await staticCanvas.loadFromJSON({
      version: "7.0.0",
      objects: sideObjects,
    })
    const artworkSvg = staticCanvas.toSVG()
    staticCanvas.dispose()

    const garmentImageUrlForApi = resolveGarmentImageUrlForCustomizerRender(
      mockupGarmentUrl,
      defaultGarmentImage
    )

    /**
     * Placement MUST be derived from the same pixel dimensions as the StaticCanvas / payload.canvas.
     * Using the outer `printArea` hook value can desync when effective canvas fallbacks differ from
     * `canvasSize`, which misaligns mockups and leaves the print PNG with empty margins on the wrong side.
     */
    const pa = getPrintArea(
      Math.round(canvasDims.width),
      Math.round(canvasDims.height),
      resolveScpPrintSizeForSide(side, scpPrintSizeId) as ScpPrintSizeId
    )
    const pw = Math.max(1, Math.round(pa.width))
    const ph = Math.max(1, Math.round(pa.height))

    const payload = {
      side,
      artworkSvg,
      garmentImageUrl: garmentImageUrlForApi,
      placement: {
        x: Math.max(0, Math.round(pa.x)),
        y: Math.max(0, Math.round(pa.y)),
        width: pw,
        height: ph,
      },
      canvas: {
        width: Math.round(canvasDims.width),
        height: Math.round(canvasDims.height),
      },
    }

    const [printResponse, mockupResponse] = await Promise.all([
      fetch("/api/customizer/render-print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      fetch("/api/customizer/render-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    ])

    const printBody = await printResponse.json().catch(() => ({}))
    const mockupBody = await mockupResponse.json().catch(() => ({}))

    if (!printResponse.ok || !mockupResponse.ok) {
      const detail = [printBody?.message, mockupBody?.message].filter(Boolean).join(" — ")
      throw new Error(detail || `Render failed (print ${printResponse.status}, mockup ${mockupResponse.status}).`)
    }

    const printUrl = extractRenderArtifactUrl(printBody) ?? extractRenderArtifactUrl((printBody as any)?.data)
    const mockupUrl = extractRenderArtifactUrl(mockupBody) ?? extractRenderArtifactUrl((mockupBody as any)?.data)

    return {
      printUrl,
      mockupUrl,
    }
  }

  /**
   * Background render cache. Key encodes everything that affects render output
   * (objects, print size, garment image, canvas dims) so a stale entry is
   * impossible — any edit changes the key and forces a fresh render at click
   * time. Cache entries hold finished URLs; in-flight entries hold the promise
   * so a click during a prefetch awaits the existing request instead of
   * starting a duplicate.
   */
  const prerenderedArtifactsRef = useRef<
    Map<GarmentSide, { key: string; printUrl: string; mockupUrl: string }>
  >(new Map())
  const inflightRendersRef = useRef<
    Map<
      GarmentSide,
      {
        key: string
        promise: Promise<{ printUrl: string | null; mockupUrl: string | null }>
      }
    >
  >(new Map())

  const buildSideRenderKey = (
    side: GarmentSide
  ):
    | {
        key: string
        canvasDims: { width: number; height: number }
        mockupGarmentUrl: string | null
        sideObjects: Record<string, unknown>[]
      }
    | null => {
    if (!selectedProduct || !selectedVariant) return null
    const w = Math.round(canvasSize.width)
    const h = Math.round(canvasSize.height)
    if (w < MIN_PRINT_AREA_PX || h < MIN_PRINT_AREA_PX) return null
    const sideObjects = sideLayoutsRef.current[side] ?? []
    if (sideObjects.length === 0) return null
    const mockupGarmentUrl = getGarmentImageUrlForPrintSide(
      selectedProduct,
      selectedVariant,
      side,
      defaultGarmentImage
    )
    let serialized: string
    try {
      serialized = JSON.stringify(sideObjects)
    } catch {
      return null
    }
    const key = `${serialized}|${scpPrintSizeId}|${mockupGarmentUrl ?? ""}|${w}x${h}`
    return { key, canvasDims: { width: w, height: h }, mockupGarmentUrl, sideObjects }
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    const handle = window.setTimeout(() => {
      DESIGN_SIDES.forEach((side) => {
        const built = buildSideRenderKey(side)
        if (!built) return
        const cached = prerenderedArtifactsRef.current.get(side)
        if (cached && cached.key === built.key) return
        const inflight = inflightRendersRef.current.get(side)
        if (inflight && inflight.key === built.key) return
        const promise = renderSideArtifacts(
          side,
          built.sideObjects,
          built.mockupGarmentUrl,
          built.canvasDims
        )
        inflightRendersRef.current.set(side, { key: built.key, promise })
        promise
          .then((res) => {
            if (res.printUrl && res.mockupUrl) {
              prerenderedArtifactsRef.current.set(side, {
                key: built.key,
                printUrl: res.printUrl,
                mockupUrl: res.mockupUrl,
              })
            }
          })
          .catch(() => {
            // Swallow — the click-time render will surface the error properly.
          })
          .finally(() => {
            const cur = inflightRendersRef.current.get(side)
            if (cur && cur.key === built.key) {
              inflightRendersRef.current.delete(side)
            }
          })
      })
    }, 800)
    return () => window.clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    layoutVersion,
    selectedProduct?.id,
    selectedVariant?.id,
    scpPrintSizeId,
    canvasSize.width,
    canvasSize.height,
    defaultGarmentImage,
  ])

  /**
   * Cancels the vectorization upsell and removes any matching cart line that a
   * previous "Add to cart" already inserted. Without the cart-side cleanup the
   * customer sees the banner disappear but still pays for vectorization at
   * checkout — exactly the gap that made the bug worth fixing.
   *
   * If the cart is unreachable, we still flip the local state but warn the
   * customer to check their cart manually rather than silently leaving the
   * stale line in place.
   */
  const handleRemoveVectorization = async () => {
    setIsRemovingVectorization(true)
    setStatusMessage(null)
    setUploadError(null)
    try {
      const cart = await retrieveCart()
      const matchingLines = (cart?.items ?? []).filter((line: any) => {
        const meta = (line?.metadata ?? {}) as Record<string, unknown>
        return meta.vectorization_for_order === true
      })
      let anyDeleteFailed = false
      for (const line of matchingLines) {
        try {
          await deleteLineItem((line as any).id)
        } catch {
          anyDeleteFailed = true
        }
      }
      setVectorizationRequested(false)
      if (anyDeleteFailed) {
        setUploadError(
          "Removed from this design, but couldn't fully clear it from your cart — please double-check the cart before checking out."
        )
      } else if (matchingLines.length > 0) {
        setStatusMessage("Vectorization service removed from your cart.")
      }
    } catch {
      setVectorizationRequested(false)
      setUploadError(
        "Removed from this design, but we couldn't reach your cart to confirm. Double-check the cart before checking out."
      )
    } finally {
      setIsRemovingVectorization(false)
    }
  }

  /**
   * Persist the current canvas state to the customer's "My Designs" without
   * sending it to the cart. Skips the heavy server-side print/mockup render —
   * those run later when the user actually adds the design to cart. The
   * thumbnail is a small inline JPEG generated client-side from Fabric.
   */
  const saveCurrentDesign = async () => {
    if (!selectedProduct || !selectedVariant) {
      setUploadError("Select a product and variant before saving.")
      return
    }
    saveCurrentSide()
    const decoratedSidesNow = DESIGN_SIDES.filter(
      (side) => (sideLayoutsRef.current[side] ?? []).length > 0
    )
    if (!decoratedSidesNow.length) {
      setUploadError("Add at least one design element before saving.")
      return
    }

    const defaultName = `${selectedProduct.title ?? "Design"} · ${new Date().toLocaleDateString()}`
    const proposedName = window.prompt("Name this design", defaultName)
    if (proposedName === null) {
      return
    }
    const name = proposedName.trim() || defaultName

    setIsSavingDesign(true)
    setStatusMessage(null)
    setUploadError(null)
    try {
      let thumbnailDataUrl: string | undefined
      try {
        const canvas = fabricCanvasRef.current
        if (canvas && typeof canvas.toDataURL === "function") {
          const url = canvas.toDataURL({
            format: "jpeg",
            quality: 0.6,
            multiplier: 0.4,
          }) as string
          if (typeof url === "string" && url.length < 120_000) {
            thumbnailDataUrl = url
          }
        }
      } catch {
        // Thumbnail is best-effort.
      }

      const partialMetadata: CustomizerMetadata = {
        ...buildCustomizerMetadataBase({
          productId: selectedProduct.id,
          sideLayoutsBySide: sideLayoutsRef.current,
          printArea,
          sizes: sizeMatrix,
          pricing,
          artifacts: [],
          scpPrintSizeId,
          printNotes,
          // Only attach the uploads referenced on this design's canvas —
          // the "My uploads" tray persists across sessions, so attaching
          // every entry would dump unrelated artwork into the saved
          // design's metadata.
          customerOriginalFiles: (() => {
            const referenced = collectReferencedUploadIds()
            return sessionUploads
              .filter((u) => u.originalStorageUrl && referenced.has(u.id))
              .map((u) => ({
                url: u.originalStorageUrl!,
                fileName: u.name,
                mimeType: u.type,
              }))
          })(),
          activeSide: currentSideRef.current,
          prints: printSpecs,
          sideDecorationMethods,
          sideEmbroideryConfigs,
        }),
        variantId: selectedVariant.id,
      }

      const result = await createMyDesign({
        name,
        thumbnail_url: thumbnailDataUrl ?? null,
        base_product_id: selectedProduct.id,
        base_variant_id: selectedVariant.id,
        customizer_metadata: partialMetadata,
      })

      if (!result.ok) {
        setUploadError(result.error)
        return
      }

      setStatusMessage(`Saved "${name}" to your designs.`)
      const savedPayload = {
        product_id: selectedProduct.id,
        variant_id: selectedVariant.id,
        sides_with_decoration: decoratedSidesNow.length,
      }
      trackCustomizerFunnel("design_saved", savedPayload)
      phCapture("customizer_design_saved", savedPayload)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to save design.")
    } finally {
      setIsSavingDesign(false)
    }
  }

  // Refresh the cross-cart bulk-tier aggregate from the backend. Called on
  // mount and after each successful add-to-cart so the tier highlight stays
  // in lockstep with the cart. Soft-fails: a fetch error leaves the previous
  // value in place so the customizer doesn't flicker between aggregated and
  // standalone modes on a transient network hiccup.
  const refreshAggregatedCartQuantity = async () => {
    try {
      const aggregate = await getScpCartAggregate()
      setAggregatedCartQuantity(aggregate?.eligible_quantity ?? 0)
    } catch {
      // Soft-fail: leave previous value in place.
    }
  }

  useEffect(() => {
    void refreshAggregatedCartQuantity()
    // Intentionally run once on mount. The aggregate doesn't change while
    // the customizer is open — only on add-to-cart, which already invokes
    // refreshAggregatedCartQuantity() inline below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addCustomizedToCart = async () => {
    if (!selectedProduct || !selectedVariant || !countryCode) {
      setUploadError("Select a product and variant before adding to cart.")
      return
    }

    saveCurrentSide()
    const totalQuantity = sizeMatrix.reduce((total, entry) => total + entry.quantity, 0)
    if (!totalQuantity) {
      setUploadError("Set at least one quantity in the size matrix.")
      return
    }

    const decoratedSides = DESIGN_SIDES.filter((side) => (sideLayoutsRef.current[side] ?? []).length > 0)
    if (!decoratedSides.length) {
      setUploadError("Add at least one design element before checkout.")
      return
    }

    if (printArea.width < MIN_PRINT_AREA_PX || printArea.height < MIN_PRINT_AREA_PX) {
      setUploadError(
        "The design preview is still loading. Wait a moment or resize the window, then try adding to cart again."
      )
      return
    }

    setIsSubmitting(true)
    setStatusMessage(null)
    setUploadError(null)

    try {
      const canvasW =
        canvasSize.width > MIN_PRINT_AREA_PX
          ? Math.round(canvasSize.width)
          : Math.max(400, Math.round(printArea.width / 0.68))
      const canvasH =
        canvasSize.height > MIN_PRINT_AREA_PX
          ? Math.round(canvasSize.height)
          : Math.max(500, Math.round(printArea.height / 0.72))
      const effectiveCanvas = { width: canvasW, height: canvasH }

      // Only fail the cart-add when an upload **actually used on this
      // design** is missing its archived copy. Stale entries in the
      // persistent "My uploads" tray that the customer didn't place on
      // this canvas are irrelevant — they used to block cart-add even
      // though they don't go on the order.
      const referencedUploadsCheck = collectReferencedUploadIds()
      const uploadsWithoutArchive = sessionUploads.filter(
        (u) => referencedUploadsCheck.has(u.id) && !u.originalStorageUrl
      )
      if (uploadsWithoutArchive.length > 0) {
        setUploadError(
          "Could not archive your uploaded file(s). On the Railway Medusa server set MinIO vars (MINIO_*), STORE_CORS to include your Vercel URL, " +
            "and redeploy. Then remove uploads in “My uploads” and choose your file again."
        )
        return
      }

      const renderedArtifacts = await Promise.all(
        decoratedSides.map(async (side) => {
          const mockupUrlForSide = getGarmentImageUrlForPrintSide(
            selectedProduct,
            selectedVariant,
            side,
            defaultGarmentImage
          )
          const sideObjects = sideLayoutsRef.current[side] ?? []

          // Try the prefetch cache first — keyed on the same inputs the
          // prefetch effect uses, so a hit means the URLs match the current
          // canvas state byte-for-byte.
          let cacheKey: string | null = null
          if (
            effectiveCanvas.width >= MIN_PRINT_AREA_PX &&
            effectiveCanvas.height >= MIN_PRINT_AREA_PX
          ) {
            try {
              cacheKey = `${JSON.stringify(sideObjects)}|${scpPrintSizeId}|${
                mockupUrlForSide ?? ""
              }|${effectiveCanvas.width}x${effectiveCanvas.height}`
            } catch {
              cacheKey = null
            }
          }
          if (cacheKey) {
            const cached = prerenderedArtifactsRef.current.get(side)
            if (cached && cached.key === cacheKey) {
              return { side, printUrl: cached.printUrl, mockupUrl: cached.mockupUrl }
            }
            const inflight = inflightRendersRef.current.get(side)
            if (inflight && inflight.key === cacheKey) {
              try {
                const res = await inflight.promise
                if (res.printUrl && res.mockupUrl) {
                  return { side, printUrl: res.printUrl, mockupUrl: res.mockupUrl }
                }
              } catch {
                // fall through to live render
              }
            }
          }

          const rendered = await renderSideArtifacts(
            side,
            sideObjects,
            mockupUrlForSide,
            effectiveCanvas
          )
          return {
            side,
            ...rendered,
          }
        })
      )

      const artifacts = renderedArtifacts.map((artifact) => ({
        side: artifact.side,
        printUrl: normalizePersistedArtifactUrl(artifact.printUrl),
        mockupUrl: normalizePersistedArtifactUrl(artifact.mockupUrl),
      }))

      const renderHadPrintAndMockupStrings = renderedArtifacts.every(
        (a) =>
          typeof a.printUrl === "string" &&
          a.printUrl.trim().length > 0 &&
          typeof a.mockupUrl === "string" &&
          a.mockupUrl.trim().length > 0
      )
      const cartHasHostedArtifactUrls = artifacts.every((a) => a.printUrl && a.mockupUrl)

      const sizeOption = selectedProduct.options?.find((option) =>
        (option.title ?? "").toLowerCase().includes("size")
      )
      const selectedVariantOptions = new Map(
        (selectedVariant.options ?? []).map((entry) => [entry.option_id, entry.value ?? ""])
      )

      const normalizedPrintNotes = printNotes
        .trim()
        .slice(0, CUSTOMIZER_PRINT_NOTES_MAX_LENGTH)

      // Only attach uploads referenced on this design's canvas. "My
      // uploads" is a persistent tray (sessionStorage) so customers can
      // reuse files across sessions; without this filter, the cart-add
      // would attach every prior upload too, which then showed up as
      // confusing customer-upload downloads on unrelated orders in the
      // admin.
      const referencedUploadIdsForCart = collectReferencedUploadIds()
      const originalFilesPayload = sessionUploads
        .filter((u) => u.originalStorageUrl && referencedUploadIdsForCart.has(u.id))
        .map((u) => ({
          url: u.originalStorageUrl!,
          fileName: u.name,
          mimeType: u.type,
        }))

      const metadataBase = buildCustomizerMetadataBase({
        productId: selectedProduct.id,
        sideLayoutsBySide: sideLayoutsRef.current,
        printArea,
        sizes: sizeMatrix,
        pricing,
        artifacts,
        scpPrintSizeId,
        printNotes: normalizedPrintNotes,
        customerOriginalFiles: originalFilesPayload,
        requiresVectorization: vectorizationRequested,
        activeSide: currentSideRef.current,
        prints: printSpecs,
        sideDecorationMethods,
        sideEmbroideryConfigs,
      })

      const resolvedQuantities =
        sizeOption && selectedProduct.variants?.length
          ? sizeMatrix
              .map((entry) => {
                const variant = selectedProduct.variants?.find((candidate) => {
                  const sizeValue = candidate.options?.find(
                    (item) => item.option_id === sizeOption.id
                  )?.value

                  if (sizeValue !== entry.size) {
                    return false
                  }

                  return (selectedProduct.options ?? []).every((option) => {
                    if (option.id === sizeOption.id) {
                      return true
                    }

                    const selectedValue = selectedVariantOptions.get(option.id) ?? ""
                    const candidateValue =
                      candidate.options?.find((item) => item.option_id === option.id)?.value ?? ""
                    return selectedValue === candidateValue
                  })
                })

                if (!variant) {
                  return null
                }

                return {
                  variant,
                  size: entry.size,
                  quantity: entry.quantity,
                }
              })
              .filter(
                (
                  entry
                ): entry is {
                  variant: HttpTypes.StoreProductVariant
                  size: string
                  quantity: number
                } => !!entry && entry.quantity > 0
              )
          : [
              {
                variant: selectedVariant,
                size: "Default",
                quantity: totalQuantity,
              },
            ]

      const unpricedSelections = resolvedQuantities.filter(
        (entry) => !variantHasConfiguredPrice(entry.variant)
      )
      if (unpricedSelections.length) {
        const labels = Array.from(new Set(unpricedSelections.map((entry) => entry.size))).join(", ")
        setUploadError(
          labels
            ? `Some selected sizes are unavailable in the selected region: ${labels}.`
            : "One or more selected variants are unavailable in the selected region."
        )
        return
      }

      // Bridge between Fabric's inline data URLs and the hosted MinIO URLs we
      // already have for each upload. `sanitizeCustomizerDesignForCart` uses
      // this map to swap data URLs for hosted URLs, so re-order rehydration
      // can actually load the images back into Fabric instead of choking on a
      // "[omitted-image-data]" placeholder (the original Phase 3 bug).
      const dataUrlToHostedUrl: Record<string, string> = {}
      for (const upload of sessionUploads) {
        if (upload.dataUrl && upload.originalStorageUrl) {
          dataUrlToHostedUrl[upload.dataUrl] = upload.originalStorageUrl
        }
      }

      for (const quantityEntry of resolvedQuantities) {
        const lineItemMetadata: CustomizerMetadata = {
          ...metadataBase,
          variantId: quantityEntry.variant.id,
          // Keep `sideLayouts` (with Fabric objects) on the line metadata so
          // `?reorder=<order_id>:<line_item_id>` can replay the design onto
          // the canvas. Previously this was overridden to empty arrays to
          // "keep the payload small" — but it broke re-order completely
          // (customer landed on a blank canvas, see screenshot in support).
          // `sanitizeCustomizerDesignForCart` already strips large `data:`
          // image URLs; what remains (positions, scales, rotations, fills,
          // hosted image URLs) is a few KB per side at most.
        }

        const addResult = await addScpLineItemToCartSafe({
          variantId: quantityEntry.variant.id,
          quantity: quantityEntry.quantity,
          countryCode,
          printSizeId: scpPrintSizeId,
          metadata: {
            customizerDesign: sanitizeCustomizerDesignForCart(
              lineItemMetadata,
              dataUrlToHostedUrl
            ),
            // When the customer entered the customizer via `?design=<id>`,
            // tag the resulting line so saved-design conversion reporting
            // can attribute the purchase back to the original design row.
            // Stored under both keys: `source_design_id` (current canonical)
            // and `designId` (legacy, kept so older reports still work).
            ...(designIdFromUrl
              ? {
                  source_design_id: designIdFromUrl,
                  designId: designIdFromUrl,
                }
              : {}),
            // Fallback display fields — if the cart later loses the
            // variant→product join (custom add path, deleted variant, or
            // partial fields population), the cart UI still has a title and
            // a working "back to product" link from these.
            product_handle: selectedProduct.handle ?? undefined,
            product_title: selectedProduct.title ?? undefined,
          },
        })

        if (!addResult.ok) {
          throw new Error(addResult.error)
        }
      }

      // Funnel signal — design successfully entered the cart. Fires once
      // per `addCustomizedToCart` invocation regardless of how many size
      // variants were added in the loop above.
      const cartedPayload = {
        product_id: selectedProduct.id,
        line_count: resolvedQuantities.length,
        total_quantity: totalQuantity,
        sides_with_decoration: decoratedSides.length,
        had_vectorization_request: vectorizationRequested,
      }
      trackCustomizerFunnel("design_added_to_cart", cartedPayload)
      phCapture("customizer_design_added_to_cart", cartedPayload)

      // Vectorization service: when the customer accepted the upsell from the
      // low-resolution modal, add the matching service SKU once per cart —
      // a single review covers everything in the cart. Re-clicking "Add to cart"
      // (e.g. after tweaking quantity) MUST NOT add a second service line: we
      // probe the cart for an existing `vectorization_for_order: true` marker
      // first. On read failure we default to "already there" so we never
      // double-charge a customer because of a transient cart fetch.
      const vectorizationVariantId =
        process.env.NEXT_PUBLIC_VECTORIZATION_VARIANT_ID?.trim()
      if (vectorizationRequested && vectorizationVariantId) {
        let cartAlreadyHasVectorization = true
        try {
          const existingCart = await retrieveCart()
          cartAlreadyHasVectorization = (existingCart?.items ?? []).some((line: any) => {
            const meta = (line?.metadata ?? {}) as Record<string, unknown>
            return meta.vectorization_for_order === true
          })
        } catch {
          // Defensive default: leave `cartAlreadyHasVectorization = true` so
          // we skip the add. Better to under-add than to double-charge.
        }

        if (!cartAlreadyHasVectorization) {
          const vectorizationResult = await addToCartSafe({
            variantId: vectorizationVariantId,
            quantity: 1,
            countryCode,
            metadata: {
              vectorization_for_order: true,
            },
          })
          if (!vectorizationResult.ok) {
            setStatusMessage(
              `Items were added, but the vectorization service couldn't be added automatically (${vectorizationResult.error}). Our team will add it during artwork review.`
            )
          }
        }
      }

      // Edit-from-cart: replace the original line by deleting it after the new
      // line has been added successfully. Then send the user back to /cart so
      // they see the updated state immediately.
      if (editLineItemId) {
        try {
          await deleteLineItem(editLineItemId)
        } catch {
          // The new line is already added; surface a hint but keep the cart consistent
          // by still navigating so the user can manually remove the old one.
          setStatusMessage(
            "Updated cart added, but couldn't remove the original line — please delete it from the cart."
          )
        }
        router.push(`/${countryCode}/cart`)
        return
      }

      router.refresh()

      // Items are now in the cart and counted in the cross-product
      // aggregate. Clear the local size matrix so the bulk-tier
      // projection doesn't double-count the just-added quantities
      // against the freshly-refreshed aggregate (which already
      // includes them).
      setSizeMatrix((prev) => prev.map((row) => ({ ...row, quantity: 0 })))

      if (!cartHasHostedArtifactUrls) {
        if (renderHadPrintAndMockupStrings) {
          setStatusMessage(
            "Added to your cart. Print/mockup files were generated, but cart metadata only keeps hosted URLs—inline fallbacks (when Minio/S3 is not configured) are dropped. Normal for local dev; configure object storage on Medusa for public links."
          )
        } else {
          setStatusMessage(
            "Customized items were added, but the render service returned no print/mockup data. Check Medusa logs and storage env (e.g. MINIO_*)."
          )
        }
        return
      }

      setStatusMessage("Customized items were added to your cart.")
      // Refresh the cross-cart aggregate so the tier highlight reflects the
      // newly-added line on the next interaction.
      void refreshAggregatedCartQuantity()
    } catch (error) {
      // Always log the full error to the browser console so the customer
      // (or whoever is debugging) can see the actual stack/message even
      // when the surfaced inline message is something generic like
      // "An unknown error occurred." (which is what the Medusa framework
      // returns for unhandled errors in route handlers).
      // eslint-disable-next-line no-console
      console.error("addCustomizedToCart failed", error)
      const baseMessage = error instanceof Error ? error.message : "Could not add customized product."
      // The generic Medusa framework default isn't actionable. Replace
      // it with a hint pointing to where to look so we can diagnose
      // failures from the field instead of staring at the generic copy.
      // For everything else, route through the sanitizer so customers don't
      // see leaked stack traces or internal paths from older backend builds.
      const friendly = /^an unknown error occurred\.?$/i.test(baseMessage.trim())
        ? "Add to cart failed on the server (no specific message returned). Open the browser console for details, or check the Railway backend logs around this timestamp."
        : sanitizeCartAddError(baseMessage)
      setUploadError(friendly)
    } finally {
      setIsSubmitting(false)
    }
  }

  const editorColumn = (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-base shadow-sm">
              <div className="flex flex-col border-b border-ui-border-base bg-ui-bg-subtle/40 px-4 py-3 small:flex-row small:items-center small:justify-between">
                <div className="flex items-start gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ui-fg-subtle">
                      Design preview
                    </p>
                    <p className="mt-0.5 text-sm text-ui-fg-base">
                      {selectedProduct?.title ? `Design your ${selectedProduct.title}` : "Design your product"}
                    </p>
                  </div>
                  {!embedded && pickerProducts && pickerProducts.length > 0 ? (
                    <CustomizerProductPicker
                      products={pickerProducts}
                      currentHandle={selectedProduct?.handle ?? null}
                      hasUnsavedDesign={() => {
                        // Any side carrying objects = real design work the
                        // customer would lose by switching products.
                        return DESIGN_SIDES.some(
                          (side) => (sideLayoutsRef.current[side] ?? []).length > 0
                        )
                      }}
                    />
                  ) : null}
                </div>
                <div className="mt-2 flex items-center gap-3 small:mt-0">
                  <p className="hidden text-xs text-ui-fg-subtle small:block">
                    Drag, resize and position your artwork.
                  </p>
                  <DesignPreviewPopover
                    decoratedSides={decoratedSides}
                    canvasSize={canvasSize}
                    sideLayouts={sideLayoutsRef.current}
                    getGarmentUrlForSide={(side) =>
                      getGarmentImageUrlForPrintSide(
                        selectedProduct,
                        selectedVariant,
                        side,
                        defaultGarmentImage
                      )
                    }
                    layoutVersion={layoutVersion}
                    variantId={activeVariantId}
                  />
                </div>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-stretch">
                <div className="order-2 border-t border-ui-border-base bg-ui-bg-subtle/30 p-4 lg:order-1 lg:w-[min(100%,280px)] lg:shrink-0 lg:border-r lg:border-t-0 lg:border-ui-border-base">
                  <InputPanel
                    onUploadFile={handleUploadFile}
                    uploads={sessionUploads.map((entry) => ({
                      id: entry.id,
                      name: entry.name,
                      previewUrl: entry.dataUrl,
                      type: entry.type,
                    }))}
                    onReuseUpload={handleReuseUpload}
                    cartDesigns={cartArtworkDesigns}
                    onAddCartDesign={handleAddCartDesignFromCart}
                    onAddText={handleAddText}
                    onAddCurvedText={handleAddCurvedText}
                    onRemoveSelectedImage={removeSelectedImage}
                    canRemoveImage={canRemoveImage}
                    onDeleteUpload={(uploadId) =>
                      setSessionUploads((current) => current.filter((entry) => entry.id !== uploadId))
                    }
                    enabled={!embedded || ((!pdpHasVariantOptions || pdpStep1Done) && pdpStep3Done)}
                    disabledMessage={
                      pdpHasVariantOptions && !pdpStep1Done
                        ? {
                            title: "Customize first",
                            body: 'Click "Customize this product" on the right to start.',
                          }
                        : !pdpStep3Done
                        ? {
                            title: "Choose a print size",
                            body:
                              "Pick a print size on the right. Once that's done, you can upload artwork here.",
                          }
                        : undefined
                    }
                    className="border-0 bg-transparent p-0"
                  />
                </div>

                <div className="order-1 min-h-[min(58vh,680px)] flex-1 p-4 small:p-5 lg:order-2">
                  <div className="z-[1]">
                    <CanvasStage
                      tintColor={variantTintHex}
                      garmentImage={garmentImageUrl}
                      garmentTitle={garmentDisplayTitle}
                      printSideKey={currentSide}
                      printArea={printArea}
                      // The dashed print rectangle is no longer rendered — image
                      // sizing/positioning is enforced invisibly via fit-to-area
                      // on placement, scale clamping during resize, and position
                      // clamping on drag, so the guide became redundant noise on
                      // garment photos that don't crop neatly to a rectangle.
                      showPrintAreaGuides={false}
                      outOfBoundsWarning={outOfBoundsWarning}
                      dpiWarning={dpiWarning}
                      fabricContainerRef={fabricContainerRef}
                    />
                  </div>
                </div>
              </div>
            </div>

            {vectorizationRequested && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-emerald-900">
                    Vectorization service requested
                  </p>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Added to your cart at checkout. Our team will redraw your artwork sharp for print.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void handleRemoveVectorization()
                  }}
                  disabled={isRemovingVectorization}
                  className="text-xs text-emerald-800 hover:text-emerald-900 underline self-start disabled:opacity-60"
                >
                  {isRemovingVectorization ? "Removing…" : "Remove"}
                </button>
              </div>
            )}
            {uploadError && (
              <p className="text-sm text-rose-600" role="alert">
                {uploadError}
              </p>
            )}
            {statusMessage && <p className="text-sm text-emerald-700">{statusMessage}</p>}
          </div>
  )

  const embeddedPdpFlowBlurb =
    "Choose product options, add artwork in the design preview, then set print side and per-size quantities using the steps below."

  const customizeRailPrintQtyAdvanced = (
    <>
            <div className="space-y-3 rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ui-fg-base">
                  {embedded ? `${embedPdpPrintStepNumber}. Print location` : "Print locations"}
                </h2>
                <span className="text-xs text-ui-fg-subtle capitalize">
                  {currentSide.replace("_", " ")}
                </span>
              </div>
              <SideSelector
                currentSide={currentSide}
                onSelectSide={switchSide}
                allowedSides={allowedPrintSides}
              />
              <p className="text-xs text-ui-fg-subtle">
                Switch sides to place art on the front, back, or sleeves. Each side is saved separately.
              </p>
              <DecorationMethodPicker
                side={currentSide}
                value={
                  sideDecorationMethods[currentSide] ??
                  (productIsBeanie ? "embroidery" : "print")
                }
                availableMethods={productIsBeanie ? ["embroidery"] : ["print", "embroidery"]}
                onChange={(side, method) => {
                  setSideDecorationMethods((prev) => ({ ...prev, [side]: method }))
                  if (method === "embroidery") {
                    setSizingDoneSides((prev) => ({ ...prev, [side]: true }))
                  } else {
                    setSideEmbroideryConfigs((prev) => {
                      const next = { ...prev }
                      delete next[side]
                      return next
                    })
                    setSizingDoneSides((prev) => {
                      const next = { ...prev }
                      delete next[side]
                      return next
                    })
                  }
                }}
              />
              {sideDecorationMethods[currentSide] === "embroidery" ? (
                <EmbroiderySideConfig
                  side={currentSide}
                  value={sideEmbroideryConfigs[currentSide]}
                  onChange={(side, next) => {
                    setSideEmbroideryConfigs((prev) => ({ ...prev, [side]: next }))
                  }}
                  getArtworkDataUrl={getCurrentSideArtworkDataUrl}
                />
              ) : null}
            </div>

            <div className="space-y-3 rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
              <div>
                <label
                  htmlFor="customizer-print-notes"
                  className="text-sm font-semibold uppercase tracking-wide text-ui-fg-base"
                >
                  Notes for production
                </label>
                <p className="mt-1 text-xs text-ui-fg-subtle">
                  Optional. Special instructions for printing or placement (max{" "}
                  {CUSTOMIZER_PRINT_NOTES_MAX_LENGTH} characters).
                </p>
              </div>
              <textarea
                id="customizer-print-notes"
                value={printNotes}
                onChange={(e) =>
                  setPrintNotes(
                    e.target.value.slice(0, CUSTOMIZER_PRINT_NOTES_MAX_LENGTH)
                  )
                }
                rows={4}
                maxLength={CUSTOMIZER_PRINT_NOTES_MAX_LENGTH}
                placeholder="e.g. Match logo PMS 185 C, keep 3 cm from collar seam…"
                className="w-full resize-y rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm text-ui-fg-base placeholder:text-ui-fg-muted outline-none focus:border-ui-border-interactive focus:ring-2 focus:ring-ui-border-interactive/20"
                disabled={isSubmitting}
              />
              <p className="text-xs text-ui-fg-muted tabular-nums">
                {printNotes.length}/{CUSTOMIZER_PRINT_NOTES_MAX_LENGTH}
              </p>
            </div>

            <PricingPanel
              currencyCode={currencyCode}
              pricing={pricing}
              sizes={sizeMatrix}
              onChangeSizeQty={changeSizeQuantity}
              onAddToCart={addCustomizedToCart}
              isSubmitting={isSubmitting}
              embeddedOnPdp={embedded}
              flyImageSrc={flyImageSrcForAddToCart}
              showDtfTierEstimator={productMetadataShowsDtfTierEstimator(selectedProduct)}
              embedPdpQuantityStepNumber={embedPdpQuantityStepNumber}
              scpPrintSizeId={scpPrintSizeId}
              onScpPrintSizeIdChange={(id) => {
                setScpPrintSizeId(id)
                setScpPrintSizeChosen(true)
              }}
              decoratedSides={decoratedSides}
              prints={printSpecs}
              onChangePrintSize={handleChangePrintSize}
              allowedPrintSizesBySide={allowedSizesBySide}
              onSaveDesign={embedded ? undefined : saveCurrentDesign}
              isSavingDesign={isSavingDesign}
              aggregatedCartQuantity={aggregatedCartQuantity}
              stockBySize={stockBySize}
            />

            <details className="group rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
              <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-wide text-ui-fg-base marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between">
                  Advanced layer tools
                  <ExpandCollapsePlus />
                </span>
              </summary>
              <div className="mt-3 border-t border-ui-border-base pt-3">
                <ManagementPanel
                  layers={layers}
                  selectedLayerId={selectedLayerId}
                  onSelectLayer={selectLayer}
                  onDeleteLayer={() => {
                    const canvas = fabricCanvasRef.current
                    const active = canvas?.getActiveObject()
                    if (!active) {
                      return
                    }
                    canvas.remove(active)
                    updateLayers()
                    saveCurrentSide()
                  }}
                  onBringForward={() => {
                    const canvas = fabricCanvasRef.current
                    const active = canvas?.getActiveObject()
                    if (!active) {
                      return
                    }
                    canvas.bringObjectForward(active)
                    canvas.renderAll()
                    saveCurrentSide()
                  }}
                  onSendBackward={() => {
                    const canvas = fabricCanvasRef.current
                    const active = canvas?.getActiveObject()
                    if (!active) {
                      return
                    }
                    canvas.sendObjectBackwards(active)
                    canvas.renderAll()
                    saveCurrentSide()
                  }}
                  onToggleLayerVisibility={toggleLayerVisibility}
                  onToggleLayerLock={toggleLayerLock}
                  onAlign={alignSelection}
                  onReplaceSvgColor={recolorSelectedSvg}
                />
              </div>
            </details>
    </>
  )

  const sidebarInner = (
            <>
            <header className="space-y-2 border-b border-ui-border-base pb-5">
              {embedded ? (
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-ui-fg-base">Customize and checkout</p>
                  <p className="mt-2 text-sm text-ui-fg-subtle">
                    {embeddedPdpFlowBlurb}
                  </p>
                </div>
              ) : (
                <>
                  {productBrand && (
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ui-fg-subtle">
                      {productBrand}
                    </p>
                  )}
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h1 className="text-2xl font-semibold leading-tight text-ui-fg-base small:text-3xl">
                        {selectedProduct?.title ?? "Customize"}
                      </h1>
                      <p className="mt-2 text-sm text-ui-fg-subtle">
                        Front, back, and sleeve placements with live pricing.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </header>

            {nonSizeOptions.length > 0 && !embedded ? (
              <div className="space-y-3 rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
                {nonSizeOptions.map((option) => {
                  const values = selectedProduct
                    ? uniqueOptionValues(selectedProduct, option.id)
                    : []
                  const current =
                    selectedVariant?.options?.find((entry) => entry.option_id === option.id)?.value ?? ""
                  const optionForSelect =
                    option.values && option.values.length > 0
                      ? option
                      : ({
                          ...option,
                          values: values.map((value) => ({ id: value, value })),
                        } as HttpTypes.StoreProductOption)

                  return (
                    <div key={option.id} className="space-y-1.5">
                      <label className="text-xs font-medium text-ui-fg-subtle">
                        {(option.title ?? "Option").toUpperCase()}
                      </label>
                      {selectedProduct ? (
                        <OptionSelect
                          product={selectedProduct}
                          option={optionForSelect}
                          current={current || undefined}
                          updateOption={(_title, value) =>
                            handleNonSizeOptionChange(option.id, value)
                          }
                          title={option.title ?? "Option"}
                          disabled={false}
                        />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}

            {customizeRailPrintQtyAdvanced}
            </>
  )

  const defaultSidebarColumn = (
          <div className="space-y-5 lg:sticky lg:top-24 lg:pr-1">
            {sidebarInner}
          </div>
  )

  const main = (
    <div className="mx-auto max-w-[1320px] space-y-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,420px)] lg:items-start lg:gap-10">
          {editorColumn}
          {defaultSidebarColumn}
        </div>
        <LowResolutionModal
          open={lowResModalOpen}
          worstDpi={dpiAssessment.worstDpi}
          imagesBelowCritical={dpiAssessment.imagesBelowCritical}
          vectorizationDisplayPrice={
            process.env.NEXT_PUBLIC_VECTORIZATION_DISPLAY_PRICE ?? null
          }
          onClose={() => {
            setLowResModalOpen(false)
            lowResModalDismissedRef.current = true
          }}
          onUploadHigherQuality={() => {
            // Best-effort: scroll the upload area into view. The exact node ID
            // doesn't exist, so fall back to gentle scroll-to-top of canvas col.
            try {
              fabricContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            } catch {
              /* noop */
            }
          }}
          onAcceptVectorization={() => {
            setVectorizationRequested(true)
            setStatusMessage(
              "Vectorization service will be added when you check out — our team will redraw your artwork sharp for print."
            )
          }}
        />
    </div>
  )

  const sideLabel =
    currentSide === "left_sleeve"
      ? "Left Sleeve"
      : currentSide === "right_sleeve"
      ? "Right Sleeve"
      : currentSide === "printed_tag"
      ? "Printed Tag"
      : currentSide.charAt(0).toUpperCase() + currentSide.slice(1)

  if (embedded && integratedPdpSlots) {
    // Guided wizard: steps reveal one at a time and collapse to a summary
    // chip with a "Change" link once completed. Mirrors the reference
    // /Customizer.mov flow.
    const hasStep1 = showPdpLabeledOptionsStep
    // `allowedPrintSides` is hoisted to the component body so the standalone
    // rail can share it; here we just react to the customer landing on a
    // disallowed side (e.g. via a stale `?side=back` querystring on a hat).
    if (!allowedPrintSides.includes(currentSide)) {
      // Snap back to a valid side without blocking render.
      Promise.resolve().then(() => switchSide("front"))
    }
    const stepOffset = hasStep1 ? 0 : 1 // when no variant options, renumber 1->location
    const stepNum = (n: number) => n - stepOffset
    const printSizeLabel =
      SCP_PRINT_SIZE_OPTIONS.find((opt) => opt.id === scpPrintSizeId)?.label ?? "Size"

    const StepHeader = ({
      num,
      title,
      done,
      onChange,
      badge,
      active,
      help,
    }: {
      num: number
      title: string
      done: boolean
      onChange?: () => void
      badge?: string
      active?: boolean
      help?: string
    }) => (
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
              done
                ? "bg-emerald-100 text-emerald-700"
                : active
                ? "bg-ui-fg-base text-white"
                : "bg-ui-bg-base text-ui-fg-subtle ring-1 ring-ui-border-base"
            }`}
            aria-hidden
          >
            {done ? "✓" : num}
          </span>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ui-fg-base truncate">
            {title}
          </h3>
          {badge && (
            <span className="shrink-0 rounded-full bg-ui-bg-base-hover px-2 py-0.5 text-[11px] font-medium text-ui-fg-base ring-1 ring-ui-border-base">
              {badge}
            </span>
          )}
          {help && <HelpTip text={help} />}
        </div>
        {done && onChange ? (
          <button
            type="button"
            className="text-xs font-medium text-ui-fg-interactive hover:underline"
            onClick={onChange}
          >
            Change
          </button>
        ) : null}
      </div>
    )

    // Dimmed, clickable preview card for steps the customer hasn't reached
    // yet. Clicking advances `pdpStep` directly so the customer can jump
    // ahead — earlier steps stay accessible via the "Change" link on their
    // collapsed summary.
    const StepPreview = ({
      num,
      title,
      hint,
      onClick,
      isNext,
    }: {
      num: number
      title: string
      hint: string
      onClick: () => void
      isNext?: boolean
    }) => (
      <button
        type="button"
        onClick={onClick}
        className={`w-full rounded-xl border p-4 text-left transition ${
          isNext
            ? "border-ui-border-strong bg-ui-bg-subtle hover:border-ui-fg-base hover:bg-ui-bg-subtle hover:shadow-sm"
            : "border-dashed border-ui-border-base bg-ui-bg-subtle/30 opacity-60 hover:border-ui-border-strong hover:opacity-90"
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
              isNext
                ? "bg-ui-bg-base text-ui-fg-base ring-1 ring-ui-border-strong"
                : "bg-ui-bg-base text-ui-fg-muted ring-1 ring-ui-border-base"
            }`}
            aria-hidden
          >
            {num}
          </span>
          <h3 className={`text-sm font-semibold uppercase tracking-wide truncate ${isNext ? "text-ui-fg-base" : "text-ui-fg-subtle"}`}>
            {title}
          </h3>
          {isNext && <span aria-hidden className="ml-auto text-xs font-medium text-ui-fg-interactive">Next →</span>}
          {!isNext && <span aria-hidden className="ml-auto text-ui-fg-muted">›</span>}
        </div>
        <p className={`mt-1.5 pl-7 text-xs ${isNext ? "text-ui-fg-subtle" : "text-ui-fg-muted"}`}>{hint}</p>
      </button>
    )

    return (
      <div id="customize" className="contents">
        {/*
          Column order is swapped on mobile via Tailwind `order-*` so the
          customer sees the Customize and checkout wizard (with the
          prominent "Customize this product" CTA in step 1) above the
          gallery / canvas. Desktop keeps the original side-by-side
          layout (col-span sits on lg, where order-* is reset to none).
        */}
        <div className={`order-2 lg:order-none flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:self-start transition-[grid-column] duration-300 ease-in-out ${
          isCustomizing ? "lg:col-span-7 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto" : "lg:col-span-6"
        }`}>
          {/* Gallery curtain-wipes away when customizing begins (pattern lifted
              from LabTierCCurtainWipeImage in the animation lab). The clipPath
              sweeps right→left while max-height collapses the layout slot —
              opacity fade overlaps so the canvas underneath fills the position
              with a smooth, cinematic hand-off. Canvas must always stay mounted
              for Fabric.js. */}
          <motion.div
            initial={false}
            animate={{
              clipPath: isCustomizing ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 0%)",
              opacity: isCustomizing ? 0 : 1,
              maxHeight: isCustomizing ? 0 : 3000,
            }}
            transition={{
              clipPath: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.3, ease: "easeOut" },
              maxHeight: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.08 },
            }}
            className={`overflow-hidden ${isCustomizing ? "pointer-events-none" : ""}`}
            aria-hidden={isCustomizing}
          >
            {integratedPdpSlots.gallery}
          </motion.div>

          {isCustomizing && (
            <button
              type="button"
              onClick={() => setPdpStep(1)}
              className="group inline-flex items-center gap-2 self-start rounded-full border border-ui-border-strong bg-ui-bg-base px-4 py-2 text-sm font-semibold text-ui-fg-base shadow-sm transition-all hover:border-ui-fg-base hover:bg-ui-bg-subtle hover:shadow-md active:scale-[0.98]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="transition-transform group-hover:-translate-x-0.5"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to product images
            </button>
          )}

          {showSideNudge && (
            <div className="flex items-center gap-2 rounded-lg bg-ui-bg-subtle/90 px-3 py-2 text-xs text-ui-fg-base ring-1 ring-ui-border-base">
              <span className="shrink-0 text-ui-fg-muted" aria-hidden>✏</span>
              Now designing <strong className="mx-0.5">{sideLabel}</strong> — upload artwork in the panel below.
            </div>
          )}

          {/* Above-canvas "Add print to another location" — visible whenever
              there are unused sides. Disabled (greyed) until the customer has
              both placed artwork on the canvas and selected a print size. */}
          {isCustomizing && allowedPrintSides.length > 1 && (() => {
            const undecoratedAllowed = allowedPrintSides.filter(
              (s) => !decoratedSides.includes(s)
            )
            if (!undecoratedAllowed.length) return null
            const nextUndecoratedSide = undecoratedAllowed[0]
            const nextUndecoratedLabel =
              nextUndecoratedSide === "left_sleeve" ? "Left Sleeve"
              : nextUndecoratedSide === "right_sleeve" ? "Right Sleeve"
              : nextUndecoratedSide === "printed_tag" ? "Printed Tag"
              : nextUndecoratedSide.charAt(0).toUpperCase() + nextUndecoratedSide.slice(1)
            const canAddLocation =
              pdpStep3Done &&
              decoratedSides.filter((s) => allowedPrintSides.includes(s)).length > 0
            return (
              <button
                type="button"
                disabled={!canAddLocation}
                title={
                  !canAddLocation
                    ? "Add artwork and select a print size first"
                    : undefined
                }
                onClick={() => {
                  if (!canAddLocation) return
                  switchSide(nextUndecoratedSide)
                  setPdpStep2Done(true)
                  setPdpStep(3)
                  setScpPrintSizeChosen(false)
                }}
                className={`w-full rounded-xl border-2 border-dashed px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                  canAddLocation
                    ? "border-fuchsia-500 text-ui-fg-base hover:border-fuchsia-600 hover:bg-fuchsia-50"
                    : "cursor-not-allowed border-ui-border-base text-ui-fg-muted opacity-40"
                }`}
              >
                + Add print to another location
                <span className="ml-1.5 text-xs font-normal opacity-70">
                  (e.g. {nextUndecoratedLabel})
                </span>
              </button>
            )
          })()}

          {editorColumn}
        </div>
        <div className={`order-1 lg:order-none flex min-w-0 flex-col gap-2 self-start lg:sticky lg:top-24 lg:pr-1 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto transition-[grid-column] duration-300 ease-in-out ${
          isCustomizing ? "lg:col-span-5" : "lg:col-span-3"
        }`}>
          <div className="space-y-1 border-b border-ui-border-base pb-3">
            <p className="text-xl font-semibold text-ui-fg-base">Customize and checkout</p>
            <p className="text-xs text-ui-fg-subtle">
              We'll guide you through each step.
            </p>
          </div>

          {editLineItemId ? (
            <div className="space-y-2 rounded-xl border-2 border-fuchsia-500 bg-amber-50 p-3 text-amber-900 shadow-[0_0_0_3px_rgba(217,70,239,0.18)]">
              <p className="text-sm font-semibold">
                Editing {editingProductTitle ?? "your cart item"}
                {editingPreviousQty ? ` × ${editingPreviousQty}` : ""}
              </p>
              <p className="text-xs">
                Quantities, notes and print size are pre-filled. Update them, then tap{" "}
                <span className="font-semibold">Update cart</span> — the original cart line will
                be replaced.
              </p>
              {editingPreviousSides.length > 0 ? (
                <p className="text-xs">
                  <span className="font-semibold">Previous artwork:</span>{" "}
                  {editingPreviousSides
                    .map((s) =>
                      s === "left_sleeve"
                        ? "Left Sleeve"
                        : s === "right_sleeve"
                        ? "Right Sleeve"
                        : s === "printed_tag"
                        ? "Printed Tag"
                        : s.charAt(0).toUpperCase() + s.slice(1)
                    )
                    .join(", ")}
                  {" — "}re-upload via the design preview to keep these prints.
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setEditLineItemId(null)
                  setEditingHydrated(false)
                  setEditingProductTitle(null)
                  setEditingPreviousSides([])
                  setEditingPreviousQty(0)
                  if (typeof window !== "undefined") {
                    const url = new URL(window.location.href)
                    url.searchParams.delete("edit")
                    window.history.replaceState({}, "", url.toString())
                  }
                }}
                className="text-xs font-medium text-amber-900 underline underline-offset-2 hover:text-amber-700"
              >
                Cancel edit (keep original line)
              </button>
            </div>
          ) : null}

          {/* Step 1 — Product options (color/etc.) */}
          {hasStep1 ? (
            <div className={`space-y-3 rounded-xl border p-4 ${
              pdpStep === 1
                ? "border-ui-fg-base bg-ui-bg-base shadow-sm"
                : "border-ui-border-base bg-ui-bg-subtle/40"
            }`}>
              <StepHeader
                num={1}
                title="Product options"
                done={pdpStep1Done && pdpStep > 1}
                active={pdpStep === 1}
                onChange={() => setPdpStep(1)}
                help="Pick your colour and any other options, then tap 'Customize this product' to open the design tool."
              />
              {pdpStep === 1 ? (
                <>
                  {integratedPdpSlots.variantPickers}
                  <button
                    type="button"
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[var(--brand-primary,#e11d48)] px-4 py-4 text-base font-bold uppercase tracking-wide text-white shadow-lg shadow-rose-500/30 ring-1 ring-rose-400/40 transition-transform hover:bg-[var(--brand-primary-hover,#be123c)] hover:scale-[1.01] active:scale-[0.99]"
                    onClick={() => {
                      setPdpStep1Done(true)
                      setPdpStep((s) => (s > 1 ? s : 2))
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                    Customize this product
                    <span aria-hidden className="text-lg leading-none">→</span>
                  </button>
                  <p className="mt-1 text-center text-[11px] text-ui-fg-subtle">
                    Free design tool · upload artwork or add text
                  </p>
                </>
              ) : (
                <p className="text-xs text-ui-fg-subtle">Selected. Click Change to edit.</p>
              )}
            </div>
          ) : null}

          {/* Step 2 — Print location */}
          {pdpStep >= 2 || !hasStep1 ? (
            (() => {
              const sideLabelMap: Record<GarmentSide, string> = {
                front: "Front",
                back: "Back",
                left_sleeve: "Left Sleeve",
                right_sleeve: "Right Sleeve",
                printed_tag: "Printed Tag",
              }
              const decoratedAllowed = decoratedSides.filter((s) => allowedPrintSides.includes(s))
              const decoratedCount = decoratedAllowed.length
              const totalAllowed = allowedPrintSides.length
              return (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                  className={`space-y-3 rounded-xl border p-4 ${
                  pdpStep === 2
                    ? "border-ui-fg-base bg-ui-bg-base shadow-sm"
                    : "border-ui-border-base bg-ui-bg-subtle/40"
                }`}>
                  <StepHeader
                    num={stepNum(2)}
                    title={decoratedCount > 0 ? "Add / change print positions" : "Print location"}
                    done={pdpStep2Done && pdpStep > 2}
                    active={pdpStep === 2}
                    badge={pdpStep2Done && pdpStep > 2 ? sideLabel : undefined}
                    help="Choose which part of the garment to print on — front, back, sleeves, or inside neck tag. Select a location, add your artwork, then use the button below the canvas to add prints to more locations. Each location is priced separately."
                    // Tabs are always visible — no "Change" button needed.
                  />

                  {/* At Step 4 collapse to just the header — saves vertical space.
                      "Change" on the header lets the customer jump back to pick
                      a different location. */}
                  {pdpStep < 4 ? (
                    <>
                      {decoratedCount > 0 ? (
                        <div className="space-y-1.5 rounded-lg bg-emerald-50/70 px-2.5 py-2 ring-1 ring-emerald-200">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                            Artwork added on {decoratedCount} of {totalAllowed} location
                            {totalAllowed === 1 ? "" : "s"}
                          </p>
                          <ul className="flex flex-wrap gap-1">
                            {decoratedAllowed.map((s) => (
                              <li
                                key={s}
                                className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-emerald-900 ring-1 ring-emerald-200"
                              >
                                <span aria-hidden>✓</span>
                                {sideLabelMap[s]}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <SideSelector
                        currentSide={currentSide}
                        allowedSides={allowedPrintSides}
                        decoratedSides={decoratedSides}
                        onSelectSide={(side) => {
                          switchSide(side)
                          setPdpStep2Done(true)
                          // Re-open Step 3 when switching to a location that hasn't
                          // been sized yet; single-size sides auto-advance immediately.
                          const newStep =
                            pdpStep > 2 && !sizingDoneSides[side] ? 3
                            : pdpStep > 2 ? pdpStep
                            : 3
                          setPdpStep(newStep)
                          // Clear the shared "size chosen" flag when moving to an
                          // unsized location so the size picker doesn't pre-select
                          // the previous side's choice.
                          if (!sizingDoneSides[side]) {
                            setScpPrintSizeChosen(false)
                          }
                        }}
                      />
                      {pdpStep === 2 && (
                        <p className="text-xs text-ui-fg-subtle">
                          Pick a location, then add artwork in the design preview. Repeat to print on
                          more spots — each location is priced separately.
                        </p>
                      )}
                      {/*
                        The decoration-method picker (Print/Embroidery) used
                        to live here, but it's now in Step 3 alongside the
                        size/embroidery configuration — that way the customer
                        can change a side's method any time they're working
                        on it, not just during the initial Step-2 setup.
                      */}
                    </>
                  ) : null}
                </motion.div>
              )
            })()
          ) : (
            <StepPreview
              num={stepNum(2)}
              title="Print location"
              hint="Pick where the artwork goes — front, back, sleeves, neck tag."
              onClick={() => setPdpStep(2)}
              isNext={pdpStep === 1}
            />
          )}

          {/* Add print to another location — magenta dashed CTA between
              Step 2 (Print location) and Step 3 (Print size). Same gate as
              before: only show once at least one location has been sized
              and there is an unused side left. */}
          {embedded && pdpStep3Done && pdpStep < 4 && allowedPrintSides.length > 1 && (() => {
            const undecoratedAllowed = allowedPrintSides.filter(
              (s) => !decoratedSides.includes(s)
            )
            if (!undecoratedAllowed.length) return null
            const nextSide = undecoratedAllowed[0]
            const nextSideLabel =
              nextSide === "left_sleeve" ? "Left Sleeve"
              : nextSide === "right_sleeve" ? "Right Sleeve"
              : nextSide === "printed_tag" ? "Printed Tag"
              : nextSide.charAt(0).toUpperCase() + nextSide.slice(1)
            return (
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                onClick={() => {
                  switchSide(nextSide)
                  setPdpStep2Done(true)
                  setPdpStep(3)
                  // The new location hasn't been sized yet, so clear the
                  // shared "size chosen" flag — otherwise the size picker
                  // shows the previous location's choice pre-highlighted
                  // and the customer has no visual cue to pick fresh.
                  setScpPrintSizeChosen(false)
                }}
                className="w-full rounded-xl border-2 border-dashed border-fuchsia-500 bg-transparent px-4 py-3 text-left text-sm font-medium text-ui-fg-base transition-colors hover:border-fuchsia-600 hover:bg-fuchsia-50"
              >
                <span className="text-base leading-none mr-2 text-fuchsia-600" aria-hidden>+</span>
                Add print to another location
                <span className="ml-1.5 text-xs font-normal text-ui-fg-subtle">
                  (e.g. {nextSideLabel})
                </span>
              </motion.button>
            )
          })()}

          {/* Step 3 — Print size */}
          {pdpStep >= 3 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className={`space-y-3 rounded-xl border p-4 ${
              pdpStep === 3
                ? "border-ui-fg-base bg-ui-bg-base shadow-sm"
                : "border-ui-border-base bg-ui-bg-subtle/40"
            }`}>
              <StepHeader
                num={stepNum(3)}
                title="Print size"
                done={currentSideSized && pdpStep > 3}
                active={pdpStep === 3}
                help="Pick the maximum print area for this location. Larger = more detail but higher cost per garment. A6 suits small logos and tags; Oversize covers most of the chest. You can choose different sizes for different locations."
                // Hide the "Change" link when the side only allows one size
                // (hats, printed_tag, short-sleeve sleeves) — there's nothing
                // to switch to, so the link would just bounce the customer
                // back into a non-interactive picker and our auto-advance
                // would immediately re-complete the step.
                onChange={
                  allowedSizesForCurrentSide.length > 1
                    ? () => {
                        setPdpStep(3)
                        // Re-pick: clear highlight so the customer makes a
                        // fresh choice rather than seeing the previous size
                        // pre-selected.
                        setScpPrintSizeChosen(false)
                      }
                    : undefined
                }
              />
              {pdpStep === 3 ? (
                <>
                  {/* Per-side method picker — always visible here so the
                      customer can switch a side between print and embroidery
                      after the initial Step-2 setup (e.g. front=print at
                      first, then change back=embroidery without re-opening
                      the print-positions step). */}
                  <div className="rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-2">
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-ui-fg-subtle">
                        Decoration method · {sideLabel}
                      </span>
                    </div>
                    <DecorationMethodPicker
                      side={currentSide}
                      value={
                        sideDecorationMethods[currentSide] ??
                        (productIsBeanie ? "embroidery" : "print")
                      }
                      availableMethods={
                        productIsBeanie ? ["embroidery"] : ["print", "embroidery"]
                      }
                      onChange={(side, method) => {
                        setSideDecorationMethods((prev) => ({ ...prev, [side]: method }))
                        if (method === "embroidery") {
                          setSizingDoneSides((prev) => ({ ...prev, [side]: true }))
                        } else {
                          setSideEmbroideryConfigs((prev) => {
                            const next = { ...prev }
                            delete next[side]
                            return next
                          })
                          setSizingDoneSides((prev) => {
                            const next = { ...prev }
                            delete next[side]
                            return next
                          })
                          // Re-prompt for print size since we just reverted to print.
                          setScpPrintSizeChosen(false)
                        }
                      }}
                    />
                  </div>
                  {sideDecorationMethods[currentSide] === "embroidery" ? (
                    <EmbroiderySideConfig
                      side={currentSide}
                      value={sideEmbroideryConfigs[currentSide]}
                      onChange={(side, next) => {
                        setSideEmbroideryConfigs((prev) => ({ ...prev, [side]: next }))
                      }}
                      getArtworkDataUrl={getCurrentSideArtworkDataUrl}
                    />
                  ) : allowedSizesForCurrentSide.length === 1 &&
                  allowedSizesForCurrentSide[0] === "up_to_a6" ? (
                    <p className="rounded-md bg-ui-bg-subtle/70 px-2.5 py-1.5 text-xs text-ui-fg-subtle">
                      <span className="font-semibold text-ui-fg-base">{sideLabel}</span> prints
                      are limited to A6 (10×15 cm) — only one size is available for this location.
                    </p>
                  ) : (currentSide === "left_sleeve" || currentSide === "right_sleeve") &&
                    productIsLongSleeve ? (
                    <p className="rounded-md bg-ui-bg-subtle/70 px-2.5 py-1.5 text-xs text-ui-fg-subtle">
                      <span className="font-semibold text-ui-fg-base">{sideLabel}</span> prints on
                      long-sleeve garments can go up to A3 (29×42 cm).
                    </p>
                  ) : null}
                  {sideDecorationMethods[currentSide] === "embroidery" ? null : (
                  <div className="grid grid-cols-2 gap-2">
                    {SCP_PRINT_SIZE_OPTIONS.filter((opt) =>
                      allowedSizesForCurrentSide.includes(opt.id)
                    ).map((opt) => {
                      // Show the price the customer will *actually* pay at their
                      // current quantity (highest 1-9 tier if no qty set yet) —
                      // not the cheapest 100+ tier. The bulk discount drops it
                      // further at higher qty, communicated via the bulk-tier
                      // panel below.
                      const matrixRow = SCP_PRINT_UNIT_MATRIX[opt.id]
                      const tierIdx = resolveScpTierIndexForQuantity(totalQty)
                      const currentPrice = matrixRow[tierIdx]
                      const bestPrice = matrixRow[matrixRow.length - 1]
                      const showsDiscountHint = currentPrice > bestPrice
                      const selected = scpPrintSizeChosen && scpPrintSizeId === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setScpPrintSizeId(opt.id)
                            setScpPrintSizeChosen(true)
                            setSizingDoneSides((prev) => ({ ...prev, [currentSide]: true as const }))
                            setPdpStep((s) => (s > 3 ? s : 4))
                          }}
                          className={`flex flex-col items-start gap-0.5 rounded-lg border p-2.5 text-left transition-colors ${
                            selected
                              ? "border-ui-border-interactive bg-ui-bg-base-pressed"
                              : "border-ui-border-base bg-ui-bg-base hover:bg-ui-bg-subtle"
                          }`}
                        >
                          <span className="text-sm font-semibold text-ui-fg-base">
                            {opt.label}
                          </span>
                          <span className="text-[11px] text-ui-fg-subtle">
                            {opt.dimensionsLabel}
                          </span>
                          <span className="text-[11px] text-ui-fg-muted">
                            ${currentPrice.toFixed(2)} ea
                            {showsDiscountHint
                              ? ` · drops to $${bestPrice.toFixed(2)} at 100+`
                              : ""}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  )}
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between gap-2 rounded-lg bg-ui-bg-subtle/60 px-2.5 py-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ui-fg-base">{printSizeLabel}</p>
                      <p className="text-[11px] text-ui-fg-muted">
                        {SCP_PRINT_SIZE_OPTIONS.find((o) => o.id === scpPrintSizeId)?.dimensionsLabel}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-ui-fg-base">
                      $
                      {SCP_PRINT_UNIT_MATRIX[scpPrintSizeId][
                        resolveScpTierIndexForQuantity(totalQty)
                      ].toFixed(2)}{" "}
                      <span className="text-[11px] font-normal text-ui-fg-subtle">ea / location</span>
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <StepPreview
              num={stepNum(3)}
              title="Print size"
              hint="Choose A6, A4, A3 or oversize for each location."
              onClick={() => setPdpStep(3)}
              isNext={pdpStep === 2}
            />
          )}

          {/* Step 4 — Quantities, notes & checkout */}
          {pdpStep >= 4 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="flex flex-col gap-3"
            >
              <div className="space-y-2 rounded-xl border border-ui-fg-base bg-ui-bg-base p-3 shadow-sm">
                <StepHeader num={stepNum(4)} title="Quantity & checkout" done={false} active={true} help="Enter how many of each size you need. Bulk discounts apply automatically — the more you order, the lower the price per garment. Once you're happy, add to cart and complete checkout." />
                {(() => {
                  const sideShortMap: Record<GarmentSide, string> = {
                    front: "Front",
                    back: "Back",
                    left_sleeve: "Left Sleeve",
                    right_sleeve: "Right Sleeve",
                    printed_tag: "Printed Tag",
                  }
                  const sidesForSummary = decoratedSides.filter((s) => allowedPrintSides.includes(s))
                  if (sidesForSummary.length === 0) {
                    return (
                      <p className="rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900 ring-1 ring-amber-200">
                        No artwork added yet — use the{" "}
                        <span className="font-semibold">Add to design</span> section in the design
                        preview to upload art or add text.
                      </p>
                    )
                  }
                  return (
                    <p className="rounded-md bg-ui-bg-subtle/70 px-2.5 py-1.5 text-xs text-ui-fg-base">
                      <span className="font-semibold">Printing on </span>
                      {sidesForSummary.map((s) => sideShortMap[s]).join(" + ")}
                      <span className="text-ui-fg-subtle"> · {printSizeLabel} each</span>
                    </p>
                  )
                })()}
              </div>
              <PricingPanel
                currencyCode={currencyCode}
                pricing={pricing}
                sizes={sizeMatrix}
                onChangeSizeQty={changeSizeQuantity}
                onAddToCart={addCustomizedToCart}
                isSubmitting={isSubmitting}
                embeddedOnPdp={embedded}
                flyImageSrc={flyImageSrcForAddToCart}
                showDtfTierEstimator={productMetadataShowsDtfTierEstimator(selectedProduct)}
                embedPdpQuantityStepNumber={embedPdpQuantityStepNumber}
                scpPrintSizeId={scpPrintSizeId}
                onScpPrintSizeIdChange={(id) => {
                setScpPrintSizeId(id)
                setScpPrintSizeChosen(true)
              }}
                decoratedSides={decoratedSides}
                prints={printSpecs}
                onChangePrintSize={handleChangePrintSize}
                allowedPrintSizesBySide={allowedSizesBySide}
                hidePrintSizeSelector
                hideHeader
                primaryCtaLabel={editLineItemId ? "Update cart" : undefined}
                primaryCtaLoadingLabel={editLineItemId ? "Updating..." : undefined}
                aggregatedCartQuantity={aggregatedCartQuantity}
                stockBySize={stockBySize}
              />
              <div className="space-y-2 rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
                <label
                  htmlFor="customizer-print-notes"
                  className="text-xs font-semibold uppercase tracking-wide text-ui-fg-subtle"
                >
                  Notes for production (optional)
                </label>
                <textarea
                  id="customizer-print-notes"
                  value={printNotes}
                  onChange={(e) =>
                    setPrintNotes(e.target.value.slice(0, CUSTOMIZER_PRINT_NOTES_MAX_LENGTH))
                  }
                  rows={3}
                  maxLength={CUSTOMIZER_PRINT_NOTES_MAX_LENGTH}
                  placeholder="e.g. Match logo PMS 185 C, keep 3 cm from collar seam…"
                  className="w-full resize-y rounded-md border border-ui-border-base bg-ui-bg-field px-3 py-2 text-sm text-ui-fg-base placeholder:text-ui-fg-muted outline-none focus:border-ui-border-interactive focus:ring-2 focus:ring-ui-border-interactive/20"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-ui-fg-muted tabular-nums">
                  {printNotes.length}/{CUSTOMIZER_PRINT_NOTES_MAX_LENGTH}
                </p>
              </div>
            </motion.div>
          ) : (
            <StepPreview
              num={stepNum(4)}
              title="Quantity & checkout"
              hint="Set sizes, quantities and add to cart."
              onClick={() => setPdpStep(4)}
              isNext={pdpStep === 3}
            />
          )}
        </div>
      </div>
    )
  }

  if (embedded && !integratedPdpSlots) {
    return (
      <section
        id="customize"
        aria-labelledby="customizer-section-title"
        className="border-t border-ui-border-base scroll-mt-28"
      >
        <div className="content-container py-8 small:py-12">
          <h2
            id="customizer-section-title"
            className="mb-6 text-2xl font-semibold text-ui-fg-base small:text-3xl"
          >
            Add your artwork
          </h2>
          {main}
        </div>
      </section>
    )
  }

  return <div className="content-container py-8 small:py-12">{main}</div>
}
