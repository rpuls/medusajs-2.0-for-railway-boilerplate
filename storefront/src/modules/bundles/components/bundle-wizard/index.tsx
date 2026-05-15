"use client"

import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { addToCartSafe, retrieveCart } from "@lib/data/cart"
import { uploadCustomerOriginalUnchanged } from "@modules/customizer/lib/upload-customer-original"
import type {
  BundleItem,
  BundleProduct,
  BundleProductVariant,
  BundleWithProducts,
} from "@lib/data/bundles"

// ---------------------------------------------------------------------------
// Cart design reuse
// ---------------------------------------------------------------------------

type CartDesign = {
  lineItemId: string
  productTitle: string
  variantTitle: string | null
  thumbnail: string | null
  artworkUrl: string | null
  decorationNotes: string | null
  bundleTitle: string | null
}

function extractCartDesigns(cart: unknown): CartDesign[] {
  const items = (cart as { items?: unknown[] } | null)?.items ?? []
  const designs: CartDesign[] = []
  for (const raw of items) {
    const item = raw as {
      id?: string
      product_title?: string | null
      variant_title?: string | null
      thumbnail?: string | null
      metadata?: Record<string, unknown> | null
    }
    const meta = item.metadata ?? {}
    const artworkUrl =
      typeof meta.artwork_url === "string" && meta.artwork_url.trim()
        ? meta.artwork_url
        : null
    const printNotes =
      typeof meta.printNotes === "string" && meta.printNotes.trim()
        ? meta.printNotes
        : null
    if (!artworkUrl && !printNotes) continue
    designs.push({
      lineItemId: item.id ?? "",
      productTitle: item.product_title ?? "Item",
      variantTitle: item.variant_title ?? null,
      thumbnail: item.thumbnail ?? null,
      artworkUrl,
      decorationNotes: printNotes,
      bundleTitle:
        typeof meta.bundle_title === "string" ? meta.bundle_title : null,
    })
  }
  // Deduplicate by artwork URL — multiple bundle lines often share one upload
  const seen = new Set<string>()
  const unique: CartDesign[] = []
  for (const d of designs) {
    const key = `${d.artworkUrl ?? ""}|${d.decorationNotes ?? ""}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(d)
  }
  return unique
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COLOR_RE = /(color|colour|shade)/i
const SIZE_RE = /size/i

function isColorOption(title: string | null | undefined) {
  return typeof title === "string" && COLOR_RE.test(title)
}

function getOptionValue(
  variant: BundleProductVariant,
  optionId: string
): string | null {
  const opt = (variant.options ?? []).find((o) => o.option?.id === optionId)
  return opt?.value ?? null
}

function getUniqueColors(
  product: BundleProduct
): { optionId: string; values: string[] } | null {
  const colorOption = (product.options ?? []).find((o) =>
    isColorOption(o.title)
  )
  if (!colorOption) return null
  const seen = new Set<string>()
  const values: string[] = []
  for (const v of product.variants) {
    const val = getOptionValue(v, colorOption.id)
    if (val && !seen.has(val)) {
      seen.add(val)
      values.push(val)
    }
  }
  return { optionId: colorOption.id, values }
}

function getSizesForColor(
  product: BundleProduct,
  colorOptionId: string,
  selectedColor: string
): { optionId: string; values: string[] } | null {
  const sizeOption = (product.options ?? []).find(
    (o) => SIZE_RE.test(o.title ?? "") && !isColorOption(o.title)
  )
  if (!sizeOption) return null
  const seen = new Set<string>()
  const values: string[] = []
  for (const v of product.variants) {
    const color = getOptionValue(v, colorOptionId)
    if (color !== selectedColor) continue
    const size = getOptionValue(v, sizeOption.id)
    if (size && !seen.has(size)) {
      seen.add(size)
      values.push(size)
    }
  }
  return { optionId: sizeOption.id, values }
}

function findVariantId(
  product: BundleProduct,
  colorOptionId: string | null,
  selectedColor: string | null,
  sizeOptionId: string | null,
  sizeValue: string
): string | null {
  for (const v of product.variants) {
    const colorMatch =
      !colorOptionId ||
      !selectedColor ||
      getOptionValue(v, colorOptionId) === selectedColor
    const sizeMatch =
      !sizeOptionId || getOptionValue(v, sizeOptionId) === sizeValue
    if (colorMatch && sizeMatch) return v.id
  }
  return null
}

const DECORATION_LABELS: Record<string, string> = {
  embroidery: "Embroidery",
  print: "Print",
  none: "No decoration",
}

// ---------------------------------------------------------------------------
// State types
// ---------------------------------------------------------------------------

type SizeQtys = Record<string, number>

type ProductConfig = {
  selectedColor: string | null
  colorOptionId: string | null
  sizeOptionId: string | null
  sizeQtys: SizeQtys
}

// ---------------------------------------------------------------------------
// Main wizard
// ---------------------------------------------------------------------------

export default function BundleWizard({
  bundle,
}: {
  bundle: BundleWithProducts
}) {
  const params = useParams()
  const router = useRouter()
  const countryCode = (params.countryCode as string) ?? "au"

  const items = useMemo(
    () => [...bundle.items].sort((a, b) => a.position - b.position),
    [bundle.items]
  )

  const TOTAL_STEPS =
    1 + // overview
    items.length + // one product config per item
    1 + // artwork + notes
    1 // review

  const [step, setStep] = useState(0)
  const [multiplier, setMultiplier] = useState(1)

  const [productConfigs, setProductConfigs] = useState<ProductConfig[]>(() =>
    items.map(() => ({
      selectedColor: null,
      colorOptionId: null,
      sizeOptionId: null,
      sizeQtys: {},
    }))
  )

  const [artworkUrl, setArtworkUrl] = useState<string | null>(null)
  const [artworkFile, setArtworkFile] = useState<File | null>(null)
  const [decorationNotes, setDecorationNotes] = useState("")
  const [uploading, setUploading] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)
  const [cartDesigns, setCartDesigns] = useState<CartDesign[]>([])
  const [loadedCart, setLoadedCart] = useState(false)
  const [reusedFrom, setReusedFrom] = useState<string | null>(null)

  const overviewStep = 0
  const reviewStep = TOTAL_STEPS - 1
  const artworkStep = reviewStep - 1

  function productStepIndex(step: number) {
    return step - 1
  }

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleColorSelect = useCallback(
    (itemIdx: number, colorOptionId: string, colorValue: string, product: BundleProduct) => {
      const sizes = getSizesForColor(product, colorOptionId, colorValue)
      const baseQty = Math.max(1, (items[itemIdx]?.quantity_per_unit ?? 1) * multiplier)
      const sizeQtys: SizeQtys = {}
      if (sizes) {
        for (const s of sizes.values) {
          sizeQtys[s] = baseQty
        }
      }
      setProductConfigs((prev) =>
        prev.map((cfg, i) =>
          i === itemIdx
            ? {
                selectedColor: colorValue,
                colorOptionId,
                sizeOptionId: sizes?.optionId ?? null,
                sizeQtys,
              }
            : cfg
        )
      )
    },
    [items, multiplier]
  )

  const handleSizeQtyChange = useCallback(
    (itemIdx: number, sizeValue: string, qty: number) => {
      setProductConfigs((prev) =>
        prev.map((cfg, i) =>
          i === itemIdx
            ? { ...cfg, sizeQtys: { ...cfg.sizeQtys, [sizeValue]: Math.max(0, qty) } }
            : cfg
        )
      )
    },
    []
  )

  const handleArtworkUpload = async (file: File) => {
    setArtworkFile(file)
    setReusedFrom(null)
    setUploading(true)
    try {
      const url = await uploadCustomerOriginalUnchanged(file)
      setArtworkUrl(url)
    } finally {
      setUploading(false)
    }
  }

  const handleReuseDesign = (design: CartDesign) => {
    setArtworkUrl(design.artworkUrl)
    setArtworkFile(null)
    if (design.decorationNotes) {
      setDecorationNotes(design.decorationNotes)
    }
    setReusedFrom(design.bundleTitle ?? design.productTitle)
  }

  // Load cart designs when entering the artwork step
  const artworkStepIndex = items.length + 1
  useEffect(() => {
    if (step !== artworkStepIndex || loadedCart) return
    setLoadedCart(true)
    void retrieveCart().then((cart) => {
      if (!cart) return
      setCartDesigns(extractCartDesigns(cart))
    })
  }, [step, artworkStepIndex, loadedCart])

  const handleAddToCart = async () => {
    setAddingToCart(true)
    setCartError(null)
    try {
      const cartAdds: Promise<{ ok: boolean; error?: string }>[] = []

      for (let i = 0; i < items.length; i++) {
        const bundleItem = items[i]
        const cfg = productConfigs[i]
        const product = bundle.products[bundleItem.product_handle]

        if (!product) continue

        const sizesToAdd = Object.entries(cfg.sizeQtys).filter(
          ([, qty]) => qty > 0
        )

        for (const [sizeValue, qty] of sizesToAdd) {
          const variantId = findVariantId(
            product,
            cfg.colorOptionId,
            cfg.selectedColor,
            cfg.sizeOptionId,
            sizeValue
          )
          if (!variantId) continue

          cartAdds.push(
            addToCartSafe({
              variantId,
              quantity: qty,
              countryCode,
              metadata: {
                bundle_id: bundle.id,
                bundle_handle: bundle.handle,
                bundle_title: bundle.title,
                bundle_item_label: bundleItem.label,
                decoration_type: bundleItem.decoration_type,
                artwork_url: artworkUrl ?? null,
                printNotes: decorationNotes || null,
              },
            })
          )
        }
      }

      const results = await Promise.all(cartAdds)
      const failed = results.filter((r) => !r.ok)
      if (failed.length > 0) {
        setCartError(
          `${failed.length} item(s) could not be added to cart. Please try again.`
        )
        return
      }

      router.push(`/${countryCode}/cart`)
    } catch (err: unknown) {
      setCartError(
        err instanceof Error ? err.message : "An error occurred. Please try again."
      )
    } finally {
      setAddingToCart(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const progressPct = Math.round((step / (TOTAL_STEPS - 1)) * 100)

  return (
    <div className="flex flex-col gap-y-6">
      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ui-bg-subtle">
        <div
          className="h-full rounded-full bg-ui-fg-interactive transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Step content */}
      {step === overviewStep && (
        <OverviewStep
          bundle={bundle}
          items={items}
          multiplier={multiplier}
          onMultiplierChange={setMultiplier}
          onNext={() => setStep(1)}
        />
      )}

      {step > overviewStep && step <= items.length && (() => {
        const itemIdx = productStepIndex(step)
        const bundleItem = items[itemIdx]
        const product = bundle.products[bundleItem?.product_handle ?? ""] ?? null
        const cfg = productConfigs[itemIdx]
        return (
          <ProductConfigStep
            bundleItem={bundleItem}
            product={product}
            config={cfg}
            itemIdx={itemIdx}
            totalItems={items.length}
            onColorSelect={(colorOptionId, colorValue) =>
              handleColorSelect(itemIdx, colorOptionId, colorValue, product!)
            }
            onSizeQtyChange={(sizeValue, qty) =>
              handleSizeQtyChange(itemIdx, sizeValue, qty)
            }
            onBack={() => setStep((s) => s - 1)}
            onNext={() => setStep((s) => s + 1)}
          />
        )
      })()}

      {step === artworkStep && (
        <ArtworkStep
          artworkFile={artworkFile}
          artworkUrl={artworkUrl}
          decorationNotes={decorationNotes}
          uploading={uploading}
          cartDesigns={cartDesigns}
          reusedFrom={reusedFrom}
          onFileChange={handleArtworkUpload}
          onNotesChange={setDecorationNotes}
          onReuseDesign={handleReuseDesign}
          onBack={() => setStep((s) => s - 1)}
          onNext={() => setStep((s) => s + 1)}
        />
      )}

      {step === reviewStep && (
        <ReviewStep
          bundle={bundle}
          items={items}
          productConfigs={productConfigs}
          artworkUrl={artworkUrl}
          decorationNotes={decorationNotes}
          addingToCart={addingToCart}
          cartError={cartError}
          onBack={() => setStep((s) => s - 1)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Step components
// ---------------------------------------------------------------------------

function OverviewStep({
  bundle,
  items,
  multiplier,
  onMultiplierChange,
  onNext,
}: {
  bundle: BundleWithProducts
  items: BundleItem[]
  multiplier: number
  onMultiplierChange: (v: number) => void
  onNext: () => void
}) {
  return (
    <div className="flex flex-col gap-y-6">
      <div>
        <h2 className="text-xl font-semibold text-ui-fg-base">What&rsquo;s in this pack</h2>
        <ul className="mt-4 flex flex-col gap-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-x-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ui-bg-subtle text-xs font-medium text-ui-fg-base">
                {item.quantity_per_unit}×
              </span>
              <span className="text-sm text-ui-fg-base">{item.label}</span>
              <span className="ml-auto text-xs text-ui-fg-muted">
                {DECORATION_LABELS[item.decoration_type] ?? item.decoration_type}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {bundle.quantity_multiplier_label ? (
        <div className="flex flex-col gap-y-2">
          <label className="text-sm font-medium text-ui-fg-base">
            {bundle.quantity_multiplier_label}
          </label>
          <div className="flex items-center gap-x-3">
            <button
              onClick={() => onMultiplierChange(Math.max(1, multiplier - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-base text-ui-fg-base hover:bg-ui-bg-subtle"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={multiplier}
              onChange={(e) =>
                onMultiplierChange(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-16 rounded-md border border-ui-border-base bg-ui-bg-base px-3 py-1.5 text-center text-sm text-ui-fg-base"
            />
            <button
              onClick={() => onMultiplierChange(multiplier + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-base text-ui-fg-base hover:bg-ui-bg-subtle"
            >
              +
            </button>
          </div>
          <p className="text-xs text-ui-fg-muted">
            All quantities below will be multiplied by this number.
          </p>
        </div>
      ) : null}

      <button
        onClick={onNext}
        className="self-start rounded-full bg-ui-fg-base px-6 py-2.5 text-sm font-medium text-ui-bg-base hover:opacity-90 transition"
      >
        Let&rsquo;s build your pack →
      </button>
    </div>
  )
}

function ProductConfigStep({
  bundleItem,
  product,
  config,
  itemIdx,
  totalItems,
  onColorSelect,
  onSizeQtyChange,
  onBack,
  onNext,
}: {
  bundleItem: BundleItem
  product: BundleProduct | null
  config: ProductConfig
  itemIdx: number
  totalItems: number
  onColorSelect: (colorOptionId: string, colorValue: string) => void
  onSizeQtyChange: (sizeValue: string, qty: number) => void
  onBack: () => void
  onNext: () => void
}) {
  const colorInfo = product ? getUniqueColors(product) : null
  const sizeInfo =
    product && config.selectedColor && config.colorOptionId
      ? getSizesForColor(product, config.colorOptionId, config.selectedColor)
      : null

  const hasQty = Object.values(config.sizeQtys).some((q) => q > 0)
  const canProceed = !product || hasQty

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ui-fg-base">
          {bundleItem.label}
        </h2>
        <span className="text-sm text-ui-fg-muted">
          Item {itemIdx + 1} of {totalItems}
        </span>
      </div>

      {!product ? (
        <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-5">
          <p className="text-sm text-ui-fg-subtle">
            Product details for this item will be confirmed by our team. Continue
            and leave a note in the decoration step if you have specific
            requirements.
          </p>
        </div>
      ) : (
        <>
          {/* Colour picker */}
          {colorInfo && colorInfo.values.length > 0 ? (
            <div className="flex flex-col gap-y-2">
              <p className="text-sm font-medium text-ui-fg-base">Select colour</p>
              <div className="flex flex-wrap gap-2">
                {colorInfo.values.map((color) => (
                  <button
                    key={color}
                    onClick={() => onColorSelect(colorInfo.optionId, color)}
                    className={[
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      config.selectedColor === color
                        ? "border-ui-fg-interactive bg-ui-fg-interactive text-ui-bg-base"
                        : "border-ui-border-base bg-ui-bg-base text-ui-fg-base hover:bg-ui-bg-subtle",
                    ].join(" ")}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Size qty table */}
          {config.selectedColor && sizeInfo && sizeInfo.values.length > 0 ? (
            <div className="flex flex-col gap-y-2">
              <p className="text-sm font-medium text-ui-fg-base">
                Set quantities per size
              </p>
              <div className="overflow-hidden rounded-xl border border-ui-border-base">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-ui-border-base bg-ui-bg-subtle">
                      <th className="px-4 py-2 text-left text-xs font-medium text-ui-fg-muted">
                        Size
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-ui-fg-muted">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeInfo.values.map((size) => (
                      <tr
                        key={size}
                        className="border-b border-ui-border-base last:border-0"
                      >
                        <td className="px-4 py-2.5 text-ui-fg-base">{size}</td>
                        <td className="px-4 py-2.5">
                          <input
                            type="number"
                            min={0}
                            value={config.sizeQtys[size] ?? 0}
                            onChange={(e) =>
                              onSizeQtyChange(
                                size,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-20 rounded-md border border-ui-border-base bg-ui-bg-base px-2 py-1 text-sm text-ui-fg-base"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {/* No size options — product has no size option (e.g. one-size) */}
          {config.selectedColor && !sizeInfo && product.variants.length > 0 ? (
            <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
              <p className="text-sm text-ui-fg-subtle">
                This item is one-size. Quantity will be set to{" "}
                {bundleItem.quantity_per_unit}.
              </p>
            </div>
          ) : null}
        </>
      )}

      <div className="flex items-center gap-x-3">
        <button
          onClick={onBack}
          className="rounded-full border border-ui-border-base px-5 py-2 text-sm text-ui-fg-base hover:bg-ui-bg-subtle transition"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="rounded-full bg-ui-fg-base px-6 py-2 text-sm font-medium text-ui-bg-base transition hover:opacity-90 disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

function ArtworkStep({
  artworkFile,
  artworkUrl,
  decorationNotes,
  uploading,
  cartDesigns,
  reusedFrom,
  onFileChange,
  onNotesChange,
  onReuseDesign,
  onBack,
  onNext,
}: {
  artworkFile: File | null
  artworkUrl: string | null
  decorationNotes: string
  uploading: boolean
  cartDesigns: CartDesign[]
  reusedFrom: string | null
  onFileChange: (file: File) => void
  onNotesChange: (v: string) => void
  onReuseDesign: (design: CartDesign) => void
  onBack: () => void
  onNext: () => void
}) {
  const [showCartPicker, setShowCartPicker] = useState(false)

  return (
    <div className="flex flex-col gap-y-6">
      <h2 className="text-xl font-semibold text-ui-fg-base">
        Artwork &amp; decoration notes
      </h2>

      {/* Reuse design from cart */}
      {cartDesigns.length > 0 ? (
        <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
          {!showCartPicker ? (
            <div className="flex items-center justify-between gap-x-3">
              <div>
                <p className="text-sm font-medium text-ui-fg-base">
                  Already have a design in your cart?
                </p>
                <p className="text-xs text-ui-fg-muted mt-0.5">
                  Reuse it for this pack instead of uploading again.
                </p>
              </div>
              <button
                onClick={() => setShowCartPicker(true)}
                className="shrink-0 rounded-full border border-ui-border-base bg-ui-bg-base px-4 py-1.5 text-xs font-medium text-ui-fg-base hover:bg-ui-bg-subtle-hover"
              >
                Browse →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ui-fg-base">
                  Pick a design to reuse
                </p>
                <button
                  onClick={() => setShowCartPicker(false)}
                  className="text-xs text-ui-fg-muted hover:text-ui-fg-base"
                >
                  Close
                </button>
              </div>
              <div className="flex flex-col gap-y-2">
                {cartDesigns.map((design) => (
                  <button
                    key={design.lineItemId}
                    onClick={() => {
                      onReuseDesign(design)
                      setShowCartPicker(false)
                    }}
                    className="flex items-center gap-x-3 rounded-lg border border-ui-border-base bg-ui-bg-base p-3 text-left hover:border-ui-border-interactive hover:bg-ui-bg-subtle-hover transition"
                  >
                    {design.artworkUrl ? (
                      <img
                        src={design.artworkUrl}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-md border border-ui-border-base bg-white object-contain"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-ui-border-base bg-ui-bg-subtle text-lg">
                        📝
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ui-fg-base truncate">
                        {design.bundleTitle ?? design.productTitle}
                      </p>
                      {design.decorationNotes ? (
                        <p className="text-xs text-ui-fg-muted line-clamp-1">
                          {design.decorationNotes}
                        </p>
                      ) : design.artworkUrl ? (
                        <p className="text-xs text-ui-fg-muted">Artwork only</p>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {reusedFrom ? (
        <div className="flex items-center gap-x-2 rounded-lg border border-ui-border-base bg-ui-bg-subtle px-3 py-2">
          <span className="text-sm text-ui-fg-base">
            ✓ Reusing design from <strong>{reusedFrom}</strong>
          </span>
        </div>
      ) : null}

      <div className="flex flex-col gap-y-2">
        <p className="text-sm font-medium text-ui-fg-base">
          {cartDesigns.length > 0 ? "Or upload" : "Upload"} your logo or artwork <span className="font-normal text-ui-fg-muted">(optional — you can send it later)</span>
        </p>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-y-2 rounded-xl border-2 border-dashed border-ui-border-base bg-ui-bg-subtle p-8 transition hover:border-ui-border-interactive">
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,application/pdf"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onFileChange(file)
            }}
          />
          {uploading ? (
            <span className="text-sm text-ui-fg-muted">Uploading…</span>
          ) : artworkFile ? (
            <>
              <span className="text-sm font-medium text-ui-fg-interactive">
                ✓ {artworkFile.name}
              </span>
              <span className="text-xs text-ui-fg-muted">Click to change</span>
            </>
          ) : (
            <>
              <span className="text-2xl">📎</span>
              <span className="text-sm text-ui-fg-muted">
                Click to upload PNG, JPG, SVG, or PDF
              </span>
            </>
          )}
        </label>
        {artworkUrl && !uploading ? (
          <p className="text-xs text-ui-fg-muted">
            Artwork saved. Our team will use this for all embroidered and printed items.
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-y-2">
        <label className="text-sm font-medium text-ui-fg-base">
          Decoration notes <span className="font-normal text-ui-fg-muted">(optional)</span>
        </label>
        <textarea
          value={decorationNotes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={4}
          placeholder="e.g. Left chest embroidery on polos, front print on t-shirts, cap front embroidery. Logo should be max 80mm wide."
          className="rounded-xl border border-ui-border-base bg-ui-bg-base px-4 py-3 text-sm text-ui-fg-base placeholder:text-ui-fg-muted resize-none focus:outline-none focus:ring-1 focus:ring-ui-border-interactive"
        />
        <p className="text-xs text-ui-fg-muted">
          Tell us where you&apos;d like each decoration placed and any size or colour preferences.
          Our team will follow up if we need more detail.
        </p>
      </div>

      <div className="flex items-center gap-x-3">
        <button
          onClick={onBack}
          className="rounded-full border border-ui-border-base px-5 py-2 text-sm text-ui-fg-base hover:bg-ui-bg-subtle transition"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={uploading}
          className="rounded-full bg-ui-fg-base px-6 py-2 text-sm font-medium text-ui-bg-base transition hover:opacity-90 disabled:opacity-40"
        >
          Review order →
        </button>
      </div>
    </div>
  )
}

function ReviewStep({
  bundle,
  items,
  productConfigs,
  artworkUrl,
  decorationNotes,
  addingToCart,
  cartError,
  onBack,
  onAddToCart,
}: {
  bundle: BundleWithProducts
  items: BundleItem[]
  productConfigs: ProductConfig[]
  artworkUrl: string | null
  decorationNotes: string
  addingToCart: boolean
  cartError: string | null
  onBack: () => void
  onAddToCart: () => void
}) {
  const hasAnyQty = productConfigs.some((cfg) =>
    Object.values(cfg.sizeQtys).some((q) => q > 0)
  )
  const hasProductsWithNoConfig = items.some(
    (item) => !bundle.products[item.product_handle]
  )

  const totalQty = productConfigs.reduce((acc, cfg) => {
    return acc + Object.values(cfg.sizeQtys).reduce((a, q) => a + q, 0)
  }, 0)

  return (
    <div className="flex flex-col gap-y-6">
      <h2 className="text-xl font-semibold text-ui-fg-base">Review your order</h2>

      <div className="flex flex-col gap-y-3">
        {items.map((item, i) => {
          const cfg = productConfigs[i]
          const product = bundle.products[item.product_handle]
          const sizes = Object.entries(cfg.sizeQtys).filter(([, q]) => q > 0)

          return (
            <div
              key={i}
              className="rounded-xl border border-ui-border-base bg-ui-bg-base p-4"
            >
              <div className="flex items-start justify-between gap-x-3">
                <div>
                  <p className="font-medium text-ui-fg-base text-sm">{item.label}</p>
                  {product ? (
                    <p className="text-xs text-ui-fg-muted mt-0.5">{product.title}</p>
                  ) : (
                    <p className="text-xs text-ui-fg-muted mt-0.5">
                      Details to be confirmed by our team
                    </p>
                  )}
                </div>
                <span className="text-xs text-ui-fg-muted shrink-0">
                  {DECORATION_LABELS[item.decoration_type] ?? item.decoration_type}
                </span>
              </div>

              {cfg.selectedColor ? (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-xs text-ui-fg-subtle">
                    Colour: <strong className="text-ui-fg-base">{cfg.selectedColor}</strong>
                  </span>
                  {sizes.length > 0 ? (
                    <span className="text-xs text-ui-fg-subtle">
                      Sizes: {sizes.map(([s, q]) => `${s}×${q}`).join(", ")}
                    </span>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-xs text-ui-fg-muted">No selection — will be handled by our team.</p>
              )}
            </div>
          )
        })}
      </div>

      {artworkUrl ? (
        <div className="flex items-center gap-x-3 rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
          <img
            src={artworkUrl}
            alt="Uploaded artwork"
            className="h-14 w-14 rounded-md object-contain border border-ui-border-base bg-white"
          />
          <p className="text-sm text-ui-fg-base">Artwork uploaded</p>
        </div>
      ) : null}

      {decorationNotes ? (
        <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
          <p className="text-xs font-medium text-ui-fg-muted mb-1">Decoration notes</p>
          <p className="text-sm text-ui-fg-base whitespace-pre-line">{decorationNotes}</p>
        </div>
      ) : null}

      {totalQty > 0 ? (
        <p className="text-sm text-ui-fg-subtle">
          Total items being added to cart: <strong className="text-ui-fg-base">{totalQty}</strong>
        </p>
      ) : null}

      {hasProductsWithNoConfig ? (
        <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle p-4">
          <p className="text-sm text-ui-fg-subtle">
            Some items in this bundle will be handled by our team during production.
            We&apos;ll reach out after your order to confirm details.
          </p>
        </div>
      ) : null}

      {cartError ? (
        <p className="rounded-xl border border-ui-tag-red-border bg-ui-tag-red-bg px-4 py-3 text-sm text-ui-tag-red-text">
          {cartError}
        </p>
      ) : null}

      <div className="flex items-center gap-x-3">
        <button
          onClick={onBack}
          disabled={addingToCart}
          className="rounded-full border border-ui-border-base px-5 py-2 text-sm text-ui-fg-base hover:bg-ui-bg-subtle transition disabled:opacity-40"
        >
          ← Back
        </button>
        <button
          onClick={onAddToCart}
          disabled={addingToCart || (!hasAnyQty && !hasProductsWithNoConfig)}
          className="rounded-full bg-ui-fg-base px-6 py-2.5 text-sm font-medium text-ui-bg-base transition hover:opacity-90 disabled:opacity-40"
        >
          {addingToCart ? "Adding to cart…" : "Add to cart"}
        </button>
      </div>
    </div>
  )
}
