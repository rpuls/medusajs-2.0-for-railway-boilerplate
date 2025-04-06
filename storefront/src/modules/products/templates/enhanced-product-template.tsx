'use client';

import React, { Suspense, useEffect, useState } from "react";
import { HttpTypes } from "@medusajs/types";
import { notFound } from "next/navigation";

import ImageGallery from "@modules/products/components/image-gallery";
import ProductActions from "@modules/products/components/product-actions";
import ProductTabs from "@modules/products/components/product-tabs";
import RelatedProducts from "@modules/products/components/related-products";
import ProductInfo from "@modules/products/templates/product-info";
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products";
import ProductActionsWrapper from "./product-actions-wrapper";
import { BlockRenderer } from "@/modules/content/components/block-renderer";
import { ContentProductService } from "@/lib/services/content-product-service";

type EnhancedProductTemplateProps = {
  product: HttpTypes.StoreProduct;
  region: HttpTypes.StoreRegion;
  countryCode: string;
}

const EnhancedProductTemplate: React.FC<EnhancedProductTemplateProps> = ({
  product: initialProduct,
  region,
  countryCode,
}) => {
  const [enrichedProduct, setEnrichedProduct] = useState<any>(initialProduct);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEnrichedProduct = async () => {
      if (!initialProduct || !initialProduct.id) return;
      
      setIsLoading(true);
      try {
        const result = await ContentProductService.getEnrichedProduct(initialProduct.id);
        if (result) {
          setEnrichedProduct({
            ...initialProduct,
            ...result,
          });
        }
      } catch (error) {
        console.error("Error fetching enriched product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrichedProduct();
  }, [initialProduct]);

  if (!enrichedProduct || !enrichedProduct.id) {
    return notFound();
  }

  // Extract content blocks from the enriched product
  const contentBlocks = enrichedProduct.content?.blocks || [];
  
  // Extract videos for the media gallery
  const videos = enrichedProduct.content?.videos || [];
  
  // Combine product images with videos for the gallery
  const mediaItems = [
    ...(enrichedProduct.images || []),
    ...videos.map((video: any) => ({
      ...video,
      isVideo: true,
    })),
  ];

  return (
    <>
      <div
        className="content-container flex flex-col small:flex-row small:items-start py-6 relative"
        data-testid="product-container"
      >
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-6">
          <ProductInfo product={enrichedProduct} />
          <ProductTabs product={enrichedProduct} />
          
          {/* Seller Information */}
          {enrichedProduct.seller && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Seller</h3>
              <div className="flex items-center">
                {enrichedProduct.seller.avatar && (
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img 
                      src={enrichedProduct.seller.avatar.url} 
                      alt={enrichedProduct.seller.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium">{enrichedProduct.seller.name}</p>
                  {enrichedProduct.seller.verified && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Verified Seller
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="block w-full relative">
          {/* Enhanced Image Gallery with Videos */}
          <ImageGallery images={mediaItems} />
          
          {/* Render Content Blocks from Payload CMS */}
          {contentBlocks.length > 0 && (
            <div className="mt-8">
              <BlockRenderer blocks={contentBlocks} />
            </div>
          )}
          
          {/* Reviews Section */}
          {enrichedProduct.reviews && enrichedProduct.reviews.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>
              <div className="space-y-6">
                {enrichedProduct.reviews.map((review: any) => (
                  <div key={review.id} className="border-b pb-6">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i}>
                            {i < review.rating ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                      <span className="font-medium">{review.title}</span>
                    </div>
                    <p className="text-gray-600 mb-2">{review.content}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{review.customer?.name || "Anonymous"}</span>
                      {review.verified && (
                        <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col small:sticky small:top-48 small:py-0 small:max-w-[300px] w-full py-8 gap-y-12">
          <Suspense
            fallback={
              <ProductActions
                disabled={true}
                product={enrichedProduct}
                region={region}
              />
            }
          >
            <ProductActionsWrapper id={enrichedProduct.id} region={region} />
          </Suspense>
          
          {/* Requirements Section */}
          {enrichedProduct.content?.requirements && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Requirements</h3>
              <div className="prose prose-sm">
                <div dangerouslySetInnerHTML={{ __html: enrichedProduct.content.requirements }} />
              </div>
            </div>
          )}
          
          {/* Documentation Link */}
          {enrichedProduct.content?.documentation && (
            <div className="mt-4">
              <a 
                href={enrichedProduct.content.documentation}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentation
              </a>
            </div>
          )}
        </div>
      </div>
      
      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={enrichedProduct} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  );
};

export default EnhancedProductTemplate;
