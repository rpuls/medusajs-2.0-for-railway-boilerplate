import React, { Suspense } from "react"

import FrequentlyBoughtTogether from "@modules/products/components/frequently-bought-together"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductionEtaStrip from "@modules/products/components/production-eta-strip"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import SkeletonProductionEtaStrip from "@modules/skeletons/components/skeleton-production-eta-strip"
import ProductActionsWrapper from "./product-actions-wrapper"
import EmbeddedProductCustomizer from "@modules/customizer/components/embedded-product-customizer"
import { getCustomerTier } from "@lib/data/customer-tier"
import MobileCustomizeCta from "@modules/products/components/mobile-customize-cta"
import PdpCustomizerBoundary from "@modules/products/components/pdp-customizer-boundary"
import DtfAutoBuilderTemplate, {
  isDtfAutoBuilderProduct,
} from "@modules/products/templates/dtf-auto-builder-template"
import BottlePdpTemplate from "@modules/bottles/components/bottle-pdp-template"
import { isBottleProduct } from "@modules/bottles/lib/is-bottle-product"
import { DecorationEstimator } from "@modules/decoration/components"
import { getEnabledDecorationMethods } from "@modules/decoration/lib/product"
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

const ProductTemplate: React.FC<ProductTemplateProps> = async ({
  product,
  region,
  countryCode,
}) => {
  if (!product || !product.id) {
    return null
  }

  const tier = await getCustomerTier()

  if (isDtfAutoBuilderProduct(product)) {
    return (
      <DtfAutoBuilderTemplate
        product={product}
        region={region}
        countryCode={countryCode}
      />
    )
  }

  if (isBottleProduct(product)) {
    return (
      <BottlePdpTemplate
        product={product}
        region={region}
        countryCode={countryCode}
      />
    )
  }

  // All products (including beanies) route through the unified customizer.
  // The customizer surfaces a per-side decoration method picker
  // (print | embroidery) — see customizer/components/decoration-method-picker
  // and embroidery-side-config. Beanies are still restricted by the
  // `allowedPrintSides` logic in customizer/templates/index.tsx (treated as
  // hats, front-only) so the experience is appropriate for the garment.

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
                    <Suspense fallback={<SkeletonProductionEtaStrip />}>
                      <ProductionEtaStrip />
                    </Suspense>
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
                      tier={tier}
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
