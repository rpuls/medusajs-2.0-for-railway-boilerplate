"use client"

import React, { Suspense, useMemo } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import ProductActionsWrapper from "./product-actions-wrapper"
import { EmbroideryPanel } from "@modules/embroidery/components"
import {
  ProductOptionsProvider,
  useProductOptions,
} from "@modules/products/context/product-options-context"
import { resolveVariantFromOptions } from "@modules/products/lib/variant-options"
import { HttpTypes } from "@medusajs/types"

type EmbroideryOnlyTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
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
      // Beanies are decorated front, back, or both — no other placements
      // are realistic on a knit pull-on cap.
      availablePlacements={["front", "back", "both"]}
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
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return null
  }

  return (
    <>
      <div className="content-container py-6 relative" data-testid="product-container">
        <ProductOptionsProvider product={product}>
          <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:items-start lg:gap-x-8 lg:gap-y-8">
            <aside className="flex flex-col gap-y-6 py-8 small:sticky small:top-48 lg:col-span-4 lg:max-w-none lg:py-0">
              <ProductInfo product={product} />
              <Suspense
                fallback={
                  <ProductActions
                    disabled={true}
                    product={product}
                    region={region}
                    hideInlinePurchaseControls
                  />
                }
              >
                <ProductActionsWrapper
                  id={product.id}
                  region={region}
                  hideInlinePurchaseControls
                />
              </Suspense>
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
      </div>

      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default EmbroideryOnlyProductTemplate
