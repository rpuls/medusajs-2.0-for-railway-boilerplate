import React, { Suspense } from "react"

import FrequentlyBoughtTogether from "@modules/products/components/frequently-bought-together"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import ProductActionsWrapper from "./product-actions-wrapper"
import EmbeddedProductCustomizer from "@modules/customizer/components/embedded-product-customizer"
import MobileCustomizeCta from "@modules/products/components/mobile-customize-cta"
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
import { CustomizeModeProvider } from "@modules/products/context/customize-mode-context"
import PdpLayoutGrid from "@modules/products/components/pdp-layout-grid"
import { ViewItemTracker } from "@modules/products/components/view-item-tracker"
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
    /** Render server-only slots HERE (parent is a server component) and
     * pass them down. The embroidery template is "use client" and cannot
     * import these directly without dragging the data layer's
     * `"server-only"` modules into the client bundle. */
    const embProductActions = (
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
    const embRelatedProducts = (
      <Suspense fallback={<SkeletonRelatedProducts />}>
        <RelatedProducts product={product} countryCode={countryCode} />
      </Suspense>
    )
    return (
      <EmbroideryOnlyProductTemplate
        product={product}
        region={region}
        countryCode={countryCode}
        productActions={embProductActions}
        relatedProducts={embRelatedProducts}
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
      heroLayout
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
      <ViewItemTracker product={product} />
      <div className="content-container py-6 relative" data-testid="product-container">
        <PrintPlacementProvider>
          <ProductOptionsProvider product={product}>
            <CustomizeModeProvider>
              <PdpLayoutGrid
                asideSlot={
                  <>
                    <ProductInfo product={product} />
                    {(() => {
                      const methods = getEnabledDecorationMethods(product)
                      return methods.length > 0 ? (
                        <DecorationEstimator methods={methods} />
                      ) : null
                    })()}
                    <ProductTabs product={product} />
                  </>
                }
                customizerSlot={
                  <PdpCustomizerBoundary>
                    <EmbeddedProductCustomizer
                      product={product}
                      integratedPdpSlots={{
                        gallery: gallerySlot,
                        variantPickers: variantPickersSlot,
                      }}
                    />
                  </PdpCustomizerBoundary>
                }
              />
            </CustomizeModeProvider>
          </ProductOptionsProvider>
        </PrintPlacementProvider>
      </div>

      {/*
        Mobile-only sticky CTA — pinned to the bottom of the viewport
        until the customer scrolls the customizer mount-point into view.
        Solves the "had to scroll past Specifications + Shipping tabs to
        find the Customize this product button" problem on phone.
      */}
      <MobileCustomizeCta />

      <div
        className="content-container my-12 small:my-20"
        data-testid="cross-sell-container"
      >
        <Suspense fallback={null}>
          <FrequentlyBoughtTogether
            product={product}
            countryCode={countryCode}
          />
        </Suspense>
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
