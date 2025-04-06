'use client';

import React, { useState, useEffect } from 'react';
import { medusaClient } from '@/lib/config';
import { ProductPreview } from './product-preview';
import { usePagination } from '@/lib/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';

interface ProductCollectionProps {
  title: string;
  ids?: string[];
  categoryId?: string;
  engineType?: string;
  assetType?: string;
  limit?: number;
  showPagination?: boolean;
}

export function ProductCollection({
  title,
  ids,
  categoryId,
  engineType,
  assetType,
  limit = 12,
  showPagination = true,
}: ProductCollectionProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Initialize pagination with default values
  const [paginationState, paginationActions] = usePagination(totalCount, {
    defaultLimit: limit,
    defaultOffset: 0,
    preserveParams: false, // Don't preserve URL params for collections
  });
  
  const { limit: pageLimit, offset } = paginationState;
  
  // Fetch products when parameters change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      
      try {
        // Build query parameters - using Medusa's pagination parameters
        const queryParams: Record<string, any> = {
          limit: pageLimit,
          offset,
        };
        
        // Add optional filters
        if (ids && ids.length > 0) {
          queryParams.id = ids;
        }
        
        if (categoryId) {
          queryParams.category_id = categoryId;
        }
        
        // Add metadata filters
        if (engineType || assetType) {
          queryParams.metadata = {};
          
          if (engineType) {
            queryParams.metadata.engineType = engineType;
          }
          
          if (assetType) {
            queryParams.metadata.assetType = assetType;
          }
        }
        
        // Fetch products from Medusa
        const { products: fetchedProducts, count } = await medusaClient.products.list(queryParams);
        
        setProducts(fetchedProducts);
        setTotalCount(count || 0);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [pageLimit, offset, ids, categoryId, engineType, assetType]);
  
  return (
    <div>
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: pageLimit }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-md mb-2"></div>
              <div className="bg-gray-200 h-4 w-2/3 rounded-md mb-2"></div>
              <div className="bg-gray-200 h-4 w-1/3 rounded-md"></div>
            </div>
          ))
        ) : products.length > 0 ? (
          // Product grid
          products.map((product) => (
            <ProductPreview key={product.id} product={product} />
          ))
        ) : (
          // No products found
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No products found</p>
          </div>
        )}
      </div>
      
      {showPagination && totalCount > pageLimit && (
        <Pagination
          state={paginationState}
          actions={paginationActions}
          totalItems={totalCount}
        />
      )}
    </div>
  );
}
