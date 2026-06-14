import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"

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
      <main
        className="w-full max-w-kin mx-auto px-kin-mobile md:px-kin-desktop py-8 md:py-12"
        data-testid="product-container"
      >
        {/* Breadcrumb */}
        <div className="mb-8 font-hanken text-sm font-semibold text-kin-on-surface-variant uppercase tracking-wider">
          <LocalizedClientLink
            href="/"
            className="hover:text-kin-primary transition-colors"
          >
            Trang chủ
          </LocalizedClientLink>
          <span className="mx-2">/</span>
          <LocalizedClientLink
            href="/store"
            className="hover:text-kin-primary transition-colors"
          >
            Cửa hàng
          </LocalizedClientLink>
          <span className="mx-2">/</span>
          <span className="text-kin-primary">{product.title}</span>
        </div>

        {/* Product Hero */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-12">
          {/* Left: Images (60%) */}
          <div className="w-full md:w-[60%]">
            <ImageGallery images={product?.images || []} />
          </div>

          {/* Right: Details (40%) */}
          <div className="w-full md:w-[40%] flex flex-col pt-2 md:pt-0">
            <div className="mb-8">
              <ProductInfo product={product} />
            </div>

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

            <div className="mt-12">
              <ProductTabs product={product} />
            </div>
          </div>
        </div>
      </main>

      {/* Safety Strip */}
      <div className="w-full bg-kin-forest text-kin-on-primary py-4 text-center">
        <p className="font-hanken text-sm font-semibold uppercase tracking-widest">
          Không mặc quá 8 tiếng liên tục
        </p>
      </div>

      {/* Related Products */}
      <section
        className="w-full max-w-kin mx-auto px-kin-mobile md:px-kin-desktop py-24"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </section>
    </>
  )
}

export default ProductTemplate
