"use client"

import { addScpLineItemToCartSafe, addToCartSafe, deleteLineItem, retrieveCart } from "@lib/data/cart"
import { createMyDesign, getMyDesign } from "@lib/data/designs"
import { getOrderLineCustomizerMetadata } from "@lib/data/orders"
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
  type ScpPrintSizeId,
} from "@modules/customizer/lib/scp-dtf-print-pricing"
import { getDisplayUnitMinorForVariant } from "@lib/util/get-product-price"
import { sanitizeCustomizerDesignForCart } from "@modules/customizer/lib/sanitize-cart-metadata"
import { uploadCustomerOriginalUnchanged } from "@modules/customizer/lib/upload-customer-original"
import {
  BulkPricingTier,
  CUSTOMIZER_PRINT_NOTES_MAX_LENGTH,
  CustomizerMetadata,
  GarmentSide,
  SizeQuantity,
} from "@modules/customizer/lib/types"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { useProductOptionsOptional } from "@modules/products/context/product-options-context"
import { sortApparelSizeLabels } from "@modules/products/lib/apparel-size-order"
import { getGarmentImageUrlForPrintSide, getPrimaryGarmentImageUrl, isLongSleeveGarmentProduct } from "@modules/products/lib/variant-options"
import { sampleImageDominantColor } from "@modules/customizer/lib/sample-image-color"
import { HttpTypes } from "@medusajs/types"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react"
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
}

// Real-world print dimensions per SCP size (cm). "Oversize" is the largest,
// matching the full 68% × 72% canvas footprint; smaller sizes are scaled
// proportionally so the dashed guide reflects what will actually be printed.
const SCP_PRINT_SIZE_CM: Record<ScpPrintSizeId, { w: number; h: number }> = {
  up_to_a6: { w: 10, h: 15 },
  up_to_a4: { w: 21, h: 30 },
  up_to_a3: { w: 29, h: 42 },
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

export default function CustomizerTemplate({
  defaultGarmentImage,
  defaultGarmentTitle,
  product,
  embedded = false,
  pdpSyncedVariantId = null,
  integratedPdpSlots,
}: CustomizerTemplateProps) {
  const params = useParams()
  const router = useRouter()
  const countryCode = String(params?.countryCode ?? "")
  const fabricCanvasRef = useRef<any>(null)
  /** Host div only — canvas is created imperatively so Fabric can replace/wrap it without breaking React siblings (garment img). */
  const fabricContainerRef = useRef<HTMLDivElement | null>(null)
  const htmlCanvasRef = useRef<HTMLCanvasElement | null>(null)

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
  const [layoutVersion, setLayoutVersion] = useState(0)
  const [scpPrintSizeId, setScpPrintSizeId] = useState<ScpPrintSizeId>(DEFAULT_SCP_PRINT_SIZE_ID)
  const [showPrintAreaGuides, setShowPrintAreaGuides] = useState(false)
  // Guided PDP wizard: tracks the highest step the user has reached (1..4).
  // Steps below `pdpStep` collapse to summary chips with a "Change" link.
  const [pdpStep, setPdpStep] = useState<1 | 2 | 3 | 4>(1)
  const [pdpStep1Done, setPdpStep1Done] = useState(false)
  const [pdpStep2Done, setPdpStep2Done] = useState(false)
  const [pdpStep3Done, setPdpStep3Done] = useState(false)
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

  // Long-sleeve garments accept up to A3 on sleeves; short-sleeve garments stay
  // A6-only. Used to gate the print-size tile picker and to clamp the global
  // scpPrintSizeId when the user switches to a side with stricter limits.
  // Reads `product` (prop) directly rather than `selectedProduct` (declared
  // later in the file) — same value, just avoids a use-before-declaration.
  const productIsLongSleeve = useMemo(
    () => isLongSleeveGarmentProduct(product),
    [product]
  )
  const allowedSizesForCurrentSide = useMemo(
    () => getAllowedScpPrintSizesForSide(currentSide, productIsLongSleeve),
    [currentSide, productIsLongSleeve]
  )
  // If the current global print size isn't allowed on this side, snap it to
  // the largest allowed size so pricing + UI stay in sync.
  useEffect(() => {
    if (!allowedSizesForCurrentSide.includes(scpPrintSizeId)) {
      const fallback = allowedSizesForCurrentSide[allowedSizesForCurrentSide.length - 1]
      if (fallback) setScpPrintSizeId(fallback)
    }
  }, [allowedSizesForCurrentSide, scpPrintSizeId])

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
  const pdpHasVariantOptions = (selectedProduct.variants?.length ?? 0) > 1
  const showPdpLabeledOptionsStep = Boolean(integratedPdpSlots) && pdpHasVariantOptions
  const embedPdpPrintStepNumber = showPdpLabeledOptionsStep ? 2 : 1
  const embedPdpQuantityStepNumber = showPdpLabeledOptionsStep ? 3 : 2
  const selectedVariant = useMemo(
    () =>
      selectedProduct?.variants?.find((variant) => variant.id === activeVariantId) ??
      selectedProduct?.variants?.[0],
    [activeVariantId, selectedProduct]
  )

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
  const pricing = calculatePricing({
    basePriceCents,
    decoratedSidesCount,
    decoratedSides,
    totalQuantity: totalQty,
    bulkPricingTiers,
    scpPrint: { printSizeId: scpPrintSizeId },
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
        setPdpStep3Done(true)
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
      }
    }
    if (pendingHydration.variantId) {
      const variantExists = product.variants?.some((v) => v.id === pendingHydration.variantId)
      if (variantExists) setActiveVariantId(pendingHydration.variantId)
    }

    void loadSide(currentSideRef.current)
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
    const canvas = fabricCanvasRef.current
    if (!canvas) {
      return
    }

    const serialized = canvas.toJSON([
      "customizerId",
      "customizerLabel",
      "sourceWidthPx",
      "sourceHeightPx",
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
    })
    if (effectivePrintSizeIdForArea === "oversize") {
      imageObject.scaleToWidth?.(getTargetArtworkWidth(printArea.width))
    } else {
      fitObjectToPrintArea(imageObject as any, printArea)
    }
    addCanvasObject(imageObject)
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

    setUploadError(null)
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
        await addUploadedAssetToCanvas({ name: nextAsset.name, type: nextAsset.type, svgText: svg })
        return
      }

      const originalPromise = uploadCustomerOriginalUnchanged(file)
      const dataUrl = await readFileAsDataUrl(file)
      const originalStorageUrl = await originalPromise
      const nextAsset: SessionUploadAsset = {
        id: `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        name: file.name || "Image",
        type: file.type,
        dataUrl,
        ...(originalStorageUrl ? { originalStorageUrl } : {}),
      }
      setSessionUploads((current) => [nextAsset, ...current.filter((entry) => entry.dataUrl !== dataUrl)])
      await addUploadedAssetToCanvas({ name: nextAsset.name, type: nextAsset.type, dataUrl })
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not upload image.")
    }
  }

  const handleReuseUpload = async (uploadId: string) => {
    const asset = sessionUploads.find((entry) => entry.id === uploadId)
    if (!asset) {
      setUploadError("That upload is no longer available.")
      return
    }

    setUploadError(null)
    try {
      if (asset.type === "image/svg+xml") {
        const prefix = "data:image/svg+xml;charset=utf-8,"
        const encoded = asset.dataUrl.startsWith(prefix) ? asset.dataUrl.slice(prefix.length) : ""
        const svgText = encoded ? decodeURIComponent(encoded) : ""
        await addUploadedAssetToCanvas({ name: asset.name, type: asset.type, svgText })
        return
      }
      await addUploadedAssetToCanvas({ name: asset.name, type: asset.type, dataUrl: asset.dataUrl })
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
    if (!active || active.type !== "image") {
      setUploadError("Select an image layer first.")
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
    const layer = layers.find((l) => l.id === selectedLayerId)
    return layer?.type === "image"
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
          customerOriginalFiles: sessionUploads
            .filter((u) => u.originalStorageUrl)
            .map((u) => ({
              url: u.originalStorageUrl!,
              fileName: u.name,
              mimeType: u.type,
            })),
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
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to save design.")
    } finally {
      setIsSavingDesign(false)
    }
  }

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

      const uploadsWithoutArchive = sessionUploads.filter((u) => !u.originalStorageUrl)
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
          const rendered = await renderSideArtifacts(
            side,
            sideLayoutsRef.current[side] ?? [],
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

      const originalFilesPayload = sessionUploads
        .filter((u) => u.originalStorageUrl)
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

      for (const quantityEntry of resolvedQuantities) {
        const lineItemMetadata: CustomizerMetadata = {
          ...metadataBase,
          variantId: quantityEntry.variant.id,
          // Cart line metadata must stay small for Medusa; print files live in `artifacts`.
          // Full Fabric state stays in-browser only (not persisted on the line item).
          sideLayouts: DESIGN_SIDES.map((side) => ({ side, objects: [] })),
        }

        const addResult = await addScpLineItemToCartSafe({
          variantId: quantityEntry.variant.id,
          quantity: quantityEntry.quantity,
          countryCode,
          printSizeId: scpPrintSizeId,
          metadata: {
            customizerDesign: sanitizeCustomizerDesignForCart(lineItemMetadata),
          },
        })

        if (!addResult.ok) {
          throw new Error(addResult.error)
        }
      }

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
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Could not add customized product.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const editorColumn = (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-ui-border-base bg-ui-bg-base shadow-sm">
              <div className="flex flex-col border-b border-ui-border-base bg-ui-bg-subtle/40 px-4 py-3 small:flex-row small:items-center small:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ui-fg-subtle">
                    Design preview
                  </p>
                  <p className="mt-0.5 text-sm text-ui-fg-base">
                    {selectedProduct?.title ? `Design your ${selectedProduct.title}` : "Design your product"}
                  </p>
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
                    onAddText={handleAddText}
                    onAddCurvedText={handleAddCurvedText}
                    onRemoveSelectedImage={removeSelectedImage}
                    canRemoveImage={canRemoveImage}
                    onDeleteUpload={(uploadId) =>
                      setSessionUploads((current) => current.filter((entry) => entry.id !== uploadId))
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
              <SideSelector currentSide={currentSide} onSelectSide={switchSide} />
              <p className="text-xs text-ui-fg-subtle">
                Switch sides to place art on the front, back, or sleeves. Each side is saved separately.
              </p>
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
              onScpPrintSizeIdChange={setScpPrintSizeId}
              decoratedSides={decoratedSides}
              onSaveDesign={embedded ? undefined : saveCurrentDesign}
              isSavingDesign={isSavingDesign}
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

  if (embedded && integratedPdpSlots) {
    // Guided wizard: steps reveal one at a time and collapse to a summary
    // chip with a "Change" link once completed. Mirrors the reference
    // /Customizer.mov flow.
    const hasStep1 = showPdpLabeledOptionsStep
    // Some product types only have front/back surfaces — no sleeves or tag.
    // Covers bottom-half garments (pants/shorts) and bags/totes/accessories.
    const productTags = getStoreProductTagValues(selectedProduct).map((t) => t.toLowerCase())
    const productTitleLower = (selectedProduct.title ?? "").toLowerCase()
    const isFrontBackOnlyProduct =
      productTags.some((t) =>
        /\b(pants?|shorts?|trousers?|jeans?|leggings?|skirts?|tote|totes|bags?|backpacks?|pouch|pouches|cap|caps|hat|hats|beanie|beanies|apron|aprons|towel|towels)\b/.test(
          t
        )
      ) ||
      /\b(tote|bag|backpack|pouch|cap|hat|beanie|apron|towel)\b/.test(productTitleLower)
    const allowedPrintSides: GarmentSide[] = isFrontBackOnlyProduct
      ? ["front", "back"]
      : ["front", "back", "left_sleeve", "right_sleeve", "printed_tag"]
    if (!allowedPrintSides.includes(currentSide)) {
      // Snap back to a valid side without blocking render.
      Promise.resolve().then(() => switchSide("front"))
    }
    const stepOffset = hasStep1 ? 0 : 1 // when no variant options, renumber 1->location
    const stepNum = (n: number) => n - stepOffset
    const sideLabel =
      currentSide === "left_sleeve"
        ? "Left Sleeve"
        : currentSide === "right_sleeve"
        ? "Right Sleeve"
        : currentSide === "printed_tag"
        ? "Printed Tag"
        : currentSide.charAt(0).toUpperCase() + currentSide.slice(1)
    const printSizeLabel =
      SCP_PRINT_SIZE_OPTIONS.find((opt) => opt.id === scpPrintSizeId)?.label ?? "Size"

    const StepHeader = ({
      num,
      title,
      done,
      onChange,
    }: {
      num: number
      title: string
      done: boolean
      onChange?: () => void
    }) => (
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
              done
                ? "bg-emerald-100 text-emerald-700"
                : "bg-ui-bg-base text-ui-fg-base ring-1 ring-ui-border-base"
            }`}
            aria-hidden
          >
            {done ? "✓" : num}
          </span>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-ui-fg-base truncate">
            {title}
          </h3>
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

    return (
      <div id="customize" className="contents">
        <div className="lg:col-span-6 flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {integratedPdpSlots.gallery}
          {editorColumn}
        </div>
        <div className="flex min-w-0 flex-col gap-3 self-start lg:col-span-3 lg:sticky lg:top-24 lg:pr-1">
          <div className="space-y-1 border-b border-ui-border-base pb-4">
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
            <div className="space-y-3 rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
              <StepHeader
                num={1}
                title="Product options"
                done={pdpStep1Done && pdpStep > 1}
                onChange={() => setPdpStep(1)}
              />
              {pdpStep === 1 ? (
                <>
                  {integratedPdpSlots.variantPickers}
                  <button
                    type="button"
                    className="w-full rounded-lg bg-ui-button-inverted py-2.5 text-sm font-semibold text-ui-fg-on-inverted hover:bg-ui-button-inverted-hover"
                    onClick={() => {
                      setPdpStep1Done(true)
                      setPdpStep((s) => (s > 1 ? s : 2))
                      if (typeof window !== "undefined") {
                        const target = document.getElementById("product-customizer")
                        target?.scrollIntoView({ behavior: "smooth", block: "start" })
                      }
                    }}
                  >
                    Customize this product
                  </button>
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
                <div className="space-y-3 rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
                  <StepHeader
                    num={stepNum(2)}
                    title={decoratedCount > 0 ? "Add / change print positions" : "Print location"}
                    done={pdpStep2Done && pdpStep > 2}
                    onChange={() => setPdpStep(2)}
                  />

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

                  {pdpStep === 2 || (!hasStep1 && pdpStep < 2) ? (
                    <>
                      <SideSelector
                        currentSide={currentSide}
                        allowedSides={allowedPrintSides}
                        onSelectSide={(side) => {
                          switchSide(side)
                          setPdpStep2Done(true)
                          setPdpStep((s) => (s > 2 ? s : 3))
                        }}
                      />
                      <p className="text-xs text-ui-fg-subtle">
                        Pick a location, then add artwork in the design preview. Repeat to print on
                        more spots — each location is priced separately.
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-ui-fg-subtle">
                      Currently editing:{" "}
                      <span className="font-medium text-ui-fg-base">{sideLabel}</span>
                    </p>
                  )}
                </div>
              )
            })()
          ) : null}

          {/* Step 3 — Print size */}
          {pdpStep >= 3 ? (
            <div className="space-y-3 rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
              <StepHeader
                num={stepNum(3)}
                title="Print size"
                done={pdpStep3Done && pdpStep > 3}
                onChange={() => setPdpStep(3)}
              />
              {pdpStep === 3 ? (
                <>
                  {allowedSizesForCurrentSide.length === 1 &&
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
                  <div className="grid grid-cols-2 gap-2">
                    {SCP_PRINT_SIZE_OPTIONS.filter((opt) =>
                      allowedSizesForCurrentSide.includes(opt.id)
                    ).map((opt) => {
                      const fromPrice = SCP_PRINT_UNIT_MATRIX[opt.id][SCP_PRINT_UNIT_MATRIX[opt.id].length - 1]
                      const selected = scpPrintSizeId === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setScpPrintSizeId(opt.id)
                            setPdpStep3Done(true)
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
                            from ${fromPrice.toFixed(2)} ea
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-xs text-ui-fg-subtle">
                    Want prints in more than one spot? Pick a size for this location, then tap{" "}
                    <span className="font-medium text-ui-fg-base">Change</span> on{" "}
                    <span className="font-medium text-ui-fg-base">Print location</span> above to
                    add another.
                  </p>
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
                      from $
                      {SCP_PRINT_UNIT_MATRIX[scpPrintSizeId][
                        SCP_PRINT_UNIT_MATRIX[scpPrintSizeId].length - 1
                      ].toFixed(2)}{" "}
                      <span className="text-[11px] font-normal text-ui-fg-subtle">ea / location</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPdpStep(2)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-dashed border-ui-border-base bg-ui-bg-subtle/40 px-3 py-2 text-left text-xs text-ui-fg-subtle transition-colors hover:border-ui-fg-base hover:bg-ui-bg-subtle hover:text-ui-fg-base"
                  >
                    <span>
                      <span className="font-semibold text-ui-fg-base">+ Add another print location</span>
                      <span className="block text-[11px] text-ui-fg-muted">
                        Go back to step {stepNum(2)} to print on a different spot too.
                      </span>
                    </span>
                    <span aria-hidden className="text-ui-fg-muted">›</span>
                  </button>
                </div>
              )}
            </div>
          ) : null}

          {/* Step 4 — Quantities, notes & checkout */}
          {pdpStep >= 4 ? (
            <>
              <div className="space-y-3 rounded-xl border border-ui-border-base bg-ui-bg-base p-4">
                <StepHeader num={stepNum(4)} title="Quantity & checkout" done={false} />
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
                <p className="text-xs text-ui-fg-subtle">
                  Set quantities per size, then add to cart.
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
                onScpPrintSizeIdChange={setScpPrintSizeId}
                decoratedSides={decoratedSides}
                hidePrintSizeSelector
                hideHeader
                primaryCtaLabel={editLineItemId ? "Update cart" : undefined}
                primaryCtaLoadingLabel={editLineItemId ? "Updating..." : undefined}
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
            </>
          ) : null}
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
