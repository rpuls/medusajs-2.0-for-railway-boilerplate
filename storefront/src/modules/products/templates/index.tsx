

import React, { Suspense, useState } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import ProductActionsWrapper from "./product-actions-wrapper"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"


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
    <div className="flex flex-col items-center w-full">
    <div className="flex flex-col justify-center w-full lg:w-[1120px]">
      <div
        className="content-container flex flex-col items-center small:flex-row small:items-start small:justify-between py-6 relative"
        data-testid="product-container"
      >

        <div className="block w-full relative">
          <ImageGallery images={product?.images || []} />
        </div>
        
        <div className="flex flex-col  small:top-48 small:py-0 small:max-w-[500px] w-full py-8 gap-y-12">
       
          <ProductOnboardingCta />
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
          <ProductInfo product={product} />
        </div>
      </div>
      <ul className="flex flex-col lg:flex-row justify-between lg:w-[500px]">
              <li className="flex flex-col items-center"><button >Descriere</button><span className="bg-[--primary-color] h-[2px] w-[70px]" /></li>
              <li className="flex flex-col items-center"><button>Informatii suplimentare</button><span className="bg-black h-[2px] w-[165px]" /></li>
              <li className="flex flex-col items-center"><button>Recenzii</button><span className="bg-black h-[2px] w-[55px]" /></li>
      </ul>
      <span className="my-[20px] w-full bg-gray-300 h-[1px]" />
      <Text
          className="text-medium text-ui-fg-subtle px-[24px] whitespace-pre-line"
          data-testid="product-description"
        >
          {product.description}
        </Text>
      </div>
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
