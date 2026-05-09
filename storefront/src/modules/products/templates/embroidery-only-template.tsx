"use client"

import React, { useMemo } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductTabs from "@modules/products/components/product-tabs"
import ProductInfo from "@modules/products/templates/product-info"
import { EmbroideryPanel } from "@modules/embroidery/components"
import {
  ProductOptionsProvider,
  useProductOptions,
} from "@modules/products/context/product-options-context"
import { PrintPlacementProvider } from "@modules/products/context/print-placement-context"
import { resolveVariantFromOptions } from "@modules/products/lib/variant-options"
import { HttpTypes } from "@medusajs/types"

type EmbroideryOnlyTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  /**
   * Pre-rendered slots passed in from the parent server component. Both
   * `<ProductActionsWrapper/>` and `<RelatedProducts/>` are server components
   * that pull `getProductsById` / `getProductsList` from a "server-only"
   * module — they cannot be imported into this client file directly without
   * forcing Next.js to bundle the data layer for the client (which fails
   * the build with `You're importing a component that needs "server-only"`).
   *
   * The slot-prop pattern mirrors how `<EmbeddedProductCustomizer>` already
   * receives `integratedPdpSlots` from the same parent.
   */
  productActions: React.ReactNode
  relatedProducts: React.ReactNode
}

/**
 * Inner client component — reads the currently selected variant from the
 * options context so the embroidery panel's "Add to cart" lands on the
 * exact colour/size the customer picked. Pulled out of the outer template
 * because it must run client-side.
 */
const EmbroideryPanelWithVariant: React.FC<{
  product: HttpTypes.StoreProduct
  countryCode: string
}> = ({ product, countryCode }) => {
  const { options } = useProductOptions()
  const variant = useMemo(
    () => resolveVariantFromOptions(product, options),
    [product, options]
  )
  return (
    <EmbroideryPanel
      variantId={variant?.id ?? null}
      countryCode={countryCode}
      // Beanies are decorated on a single face — pick front, back, left
      // side, or right side. No multi-side combos: the customer adds a
      // second cart line if they want a logo on more than one face.
      availablePlacements={["front", "back", "left", "right"]}
    />
  )
}

/**
 * Embroidery-only PDP — used for beanies and any other product that opts
 * out of the print customizer in favour of an embroidery-only purchase
 * flow. Renders the standard gallery / info / variant pickers + the
 * embroidery estimator with cart-add wired through the embroidery line-
 * items route.
 *
 * The print customizer is omitted entirely. Variant selection happens via
 * ProductActions on the left column (with the print-flow add-to-cart
 * suppressed via `hideInlinePurchaseControls`); the embroidery panel on
 * the right owns its own quantity input and "Add embroidery to cart"
 * button.
 */
const EmbroideryOnlyProductTemplate: React.FC<EmbroideryOnlyTemplateProps> = ({
  product,
  region: _region,
  countryCode,
  productActions,
  relatedProducts,
}) => {
  if (!product || !product.id) {
    return null
  }

  return (
    <>
      <div className="content-container py-6 relative" data-testid="product-container">
        {/*
          PrintPlacementProvider is required because ProductActions (rendered
          inside the variant pickers below) calls usePrintPlacement() at the
          top level. Beanies don't actually use print placements — the
          embroidery flow has its own placement picker — but the provider
          still needs to be in scope so the shared ProductActions component
          doesn't throw "usePrintPlacement must be used within
          PrintPlacementProvider".
        */}
        <PrintPlacementProvider>
        <ProductOptionsProvider product={product}>
          <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:items-start lg:gap-x-8 lg:gap-y-8">
            <aside className="flex flex-col gap-y-6 py-8 small:sticky small:top-48 lg:col-span-4 lg:max-w-none lg:py-0">
              <ProductInfo product={product} />
              {productActions}
              <ProductTabs product={product} />
            </aside>

            <div className="lg:col-span-8 grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="lg:col-span-1">
                <ImageGallery
                  product={product}
                  images={product?.images || []}
                  thumbnail={product?.thumbnail || null}
                />
              </div>
              <div className="lg:col-span-1 flex flex-col gap-y-6">
                <div className="rounded-lg border border-ui-border-base bg-ui-bg-subtle/40 p-4">
                  <h2 className="text-base font-semibold text-ui-fg-base">
                    Decoration: embroidery only
                  </h2>
                  <p className="mt-1 text-sm text-ui-fg-subtle">
                    This product is decorated with embroidery — print isn't
                    available on this style. Pick your colour/size on the
                    left, then build your design and add to cart below.
                  </p>
                </div>
                <EmbroideryPanelWithVariant product={product} countryCode={countryCode} />
              </div>
            </div>
          </div>
        </ProductOptionsProvider>
        </PrintPlacementProvider>
      </div>

      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        {relatedProducts}
      </div>
    </>
  )
}

export default EmbroideryOnlyProductTemplate
