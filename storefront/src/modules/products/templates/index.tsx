import React, { Suspense } from "react"
import dynamicImport from "next/dynamic"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"

// Lazy load heavy components for better code splitting
const ProductTabs = dynamicImport(
  () => import("@modules/products/components/product-tabs"),
  {
    ssr: true, // Keep SSR for SEO
  }
)

const RelatedProducts = dynamicImport(
  () => import("@modules/products/components/related-products"),
  {
    ssr: true, // Keep SSR for SEO
  }
)

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
    return notFound()
  }

  return (
    <>
      <div
        className="content-container py-8 md:py-12"
        data-testid="product-container"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Image Gallery */}
          <div className="w-full">
            <ImageGallery 
              images={product?.images || []} 
              productName={product.title}
              categoryName={product.categories?.[0]?.name}
              brandName={(product as any).metadata?._brand_name}
            />
          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
            <ProductInfo product={product} />

            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>
        </div>

        {/* Product Tabs Below - Lazy loaded */}
        <div className="mt-12 lg:mt-16">
          <Suspense fallback={<div className="h-64 bg-background-elevated animate-pulse rounded-lg" />}>
            <ProductTabs product={product} />
          </Suspense>
        </div>
      </div>

      {/* Related Products - Lazy loaded */}
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
