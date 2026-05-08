import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import ProductActionsWrapper from "./product-actions-wrapper"
import EmbeddedProductCustomizer from "@modules/customizer/components/embedded-product-customizer"
import PdpCustomizerBoundary from "@modules/products/components/pdp-customizer-boundary"
import DtfAutoBuilderTemplate, {
  isDtfAutoBuilderProduct,
} from "@modules/products/templates/dtf-auto-builder-template"
import EmbroideryOnlyProductTemplate from "@modules/products/templates/embroidery-only-template"
import { DecorationEstimator } from "@modules/decoration/components"
import { getEnabledDecorationMethods } from "@modules/decoration/lib/product"
import { isBeanieGarmentProduct } from "@modules/products/lib/variant-options"
import { HttpTypes } from "@medusajs/types"
import { PrintPlacementProvider } from "@modules/products/context/print-placement-context"
import { ProductOptionsProvider } from "@modules/products/context/product-options-context"
type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return null
  }

  if (isDtfAutoBuilderProduct(product)) {
    return (
      <DtfAutoBuilderTemplate
        product={product}
        region={region}
        countryCode={countryCode}
      />
    )
  }

  // Beanies skip the print customizer entirely — embroidery is the only
  // realistic decoration on a knit pull-on cap.
  if (isBeanieGarmentProduct(product)) {
    return (
      <EmbroideryOnlyProductTemplate
        product={product}
        region={region}
        countryCode={countryCode}
        // Slot-prop pattern: ProductActionsWrapper + RelatedProducts both
        // transitively import `server-only`, so they cannot live inside the
        // `"use client"` template. Render them here in the server parent
        // and pass through as ReactNode props.
        productActions={
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
        }
        relatedProducts={
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        }
      />
    )
  }

  // The customizer flow is the only purchase path — blank garments cannot be
  // ordered directly. ProductActions renders a "Customize this product" CTA
  // (via `hideInlinePurchaseControls`) that scrolls to the embedded
  // customizer.
  const gallerySlot = (
    <ImageGallery
      product={product}
      images={product?.images || []}
      thumbnail={product?.thumbnail || null}
    />
  )
  const variantPickersSlot = (
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
  )

  return (
    <>
      <div className="content-container py-6 relative" data-testid="product-container">
        <PrintPlacementProvider>
          <ProductOptionsProvider product={product}>
            <div className="grid grid-cols-1 gap-y-10 lg:grid-cols-12 lg:items-start lg:gap-x-8 lg:gap-y-8">
              <aside className="flex flex-col gap-y-6 py-8 small:sticky small:top-48 lg:col-span-3 lg:max-w-none lg:py-0">
                <ProductInfo product={product} />
                {(() => {
                  const methods = getEnabledDecorationMethods(product)
                  return methods.length > 0 ? (
                    <DecorationEstimator methods={methods} />
                  ) : null
                })()}
                <ProductTabs product={product} />
              </aside>

              <div
                id="product-customizer"
                className="lg:col-span-9 grid gap-8 lg:grid-cols-9 lg:items-start"
              >
                <PdpCustomizerBoundary>
                  <EmbeddedProductCustomizer
                    product={product}
                    integratedPdpSlots={{
                      gallery: gallerySlot,
                      variantPickers: variantPickersSlot,
                    }}
                  />
                </PdpCustomizerBoundary>
              </div>
            </div>
          </ProductOptionsProvider>
        </PrintPlacementProvider>
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

export default ProductTemplate
