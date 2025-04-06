'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductPreview } from '@/modules/products/components/product-preview';
import { usePagination } from '@/lib/hooks/use-pagination';
import { Pagination } from '@/components/ui/pagination';
import { medusaClient } from '@/lib/config';

interface ProductGridProps {
  categoryId?: string;
  engineType?: string;
  assetType?: string;
  searchQuery?: string;
  sortBy?: string;
  className?: string;
}

export function ProductGrid({
  categoryId,
  engineType,
  assetType,
  searchQuery,
  sortBy = 'created_at',
  className = '',
}: ProductGridProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  
  // Initialize pagination with default values
  const [paginationState, paginationActions] = usePagination(totalCount, {
    defaultLimit: 12,
    defaultOffset: 0,
    preserveParams: true,
  });
  
  const { limit, offset } = paginationState;
  
  // Fetch products when parameters change
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      
      try {
        // Build query parameters - using Medusa's pagination parameters
        const queryParams: Record<string, any> = {
          limit,
          offset,
        };
        
        // Add optional filters
        if (categoryId) {
          queryParams.category_id = categoryId;
        }
        
        if (searchQuery) {
          queryParams.q = searchQuery;
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
        
        // Add sorting
        if (sortBy) {
          const [field, order] = sortBy.split('_');
          queryParams.order = field;
          queryParams.sort = order === 'desc' ? 'DESC' : 'ASC';
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
  }, [limit, offset, categoryId, engineType, assetType, searchQuery, sortBy]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: limit }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-md mb-2"></div>
            <div className="bg-gray-200 h-4 w-2/3 rounded-md mb-2"></div>
            <div className="bg-gray-200 h-4 w-1/3 rounded-md"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-medium mb-2">No products found</h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {products.map((product) => (
          <ProductPreview key={product.id} product={product} />
        ))}
      </div>
      
      <Pagination
        state={paginationState}
        actions={paginationActions}
        totalItems={totalCount}
      />
    </div>
  );
}
