'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaginationState, PaginationActions } from '@/lib/hooks/use-pagination';

interface PaginationProps {
  state: PaginationState;
  actions: PaginationActions;
  totalItems: number;
  showItemsPerPage?: boolean;
  className?: string;
}

export function Pagination({
  state,
  actions,
  totalItems,
  showItemsPerPage = true,
  className = '',
}: PaginationProps) {
  const { currentPage, pageCount, hasNextPage, hasPreviousPage, limit, offset } = state;
  const { goToPage, nextPage, previousPage, setLimit } = actions;
  
  // Calculate visible page range
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show before and after current page
    const pages: (number | 'ellipsis')[] = [];
    
    // Always show first page
    pages.push(1);
    
    // Calculate range of pages to show around current page
    const rangeStart = Math.max(2, currentPage - delta);
    const rangeEnd = Math.min(pageCount - 1, currentPage + delta);
    
    // Add ellipsis if there's a gap after page 1
    if (rangeStart > 2) {
      pages.push('ellipsis');
    }
    
    // Add pages in the middle
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    
    // Add ellipsis if there's a gap before the last page
    if (rangeEnd < pageCount - 1) {
      pages.push('ellipsis');
    }
    
    // Always show last page if there is more than one page
    if (pageCount > 1) {
      pages.push(pageCount);
    }
    
    return pages;
  };
  
  const visiblePages = getVisiblePages();
  const startItem = offset + 1;
  const endItem = Math.min(offset + limit, totalItems);
  
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {startItem}-{endItem} of {totalItems} items
        </div>
        
        {showItemsPerPage && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Items per page:</span>
            <Select
              value={String(limit)}
              onValueChange={(value) => setLimit(parseInt(value, 10))}
            >
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue placeholder={limit} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="36">36</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={previousPage}
          disabled={!hasPreviousPage}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {visiblePages.map((page, index) => 
          page === 'ellipsis' ? (
            <Button
              key={`ellipsis-${index}`}
              variant="ghost"
              size="icon"
              disabled
              className="cursor-default"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="icon"
              onClick={() => goToPage(page)}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </Button>
          )
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={nextPage}
          disabled={!hasNextPage}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
