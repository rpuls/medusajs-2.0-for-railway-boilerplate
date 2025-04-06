import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface PaginationOptions {
  defaultLimit?: number;
  defaultOffset?: number;
  preserveParams?: boolean;
}

export interface PaginationState {
  limit: number;
  offset: number;
  currentPage: number;
  pageCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setLimit: (limit: number) => void;
  getPaginationParams: () => { limit: number; offset: number };
}

/**
 * Hook for managing pagination state and actions
 * Compatible with Medusa's pagination parameters
 */
export function usePagination(
  totalCount: number,
  options: PaginationOptions = {}
): [PaginationState, PaginationActions] {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get options with defaults
  const {
    defaultLimit = 12,
    defaultOffset = 0,
    preserveParams = true,
  } = options;
  
  // Initialize state from URL or defaults
  const [limit, setLimitState] = useState<number>(
    searchParams.has('limit') 
      ? parseInt(searchParams.get('limit') || String(defaultLimit), 10) 
      : defaultLimit
  );
  
  const [offset, setOffsetState] = useState<number>(
    searchParams.has('offset') 
      ? parseInt(searchParams.get('offset') || String(defaultOffset), 10) 
      : defaultOffset
  );
  
  // Calculate derived state
  const currentPage = Math.floor(offset / limit) + 1;
  const pageCount = Math.ceil(totalCount / limit);
  const hasNextPage = offset + limit < totalCount;
  const hasPreviousPage = offset > 0;
  
  // Update URL when pagination changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(preserveParams ? searchParams.toString() : '');
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    
    // Update URL without refreshing the page
    const url = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ path: url }, '', url);
  }, [limit, offset, preserveParams, searchParams]);
  
  // Actions
  const goToPage = useCallback((page: number) => {
    const newPage = Math.max(1, Math.min(page, pageCount));
    const newOffset = (newPage - 1) * limit;
    setOffsetState(newOffset);
  }, [limit, pageCount]);
  
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setOffsetState(offset + limit);
    }
  }, [hasNextPage, limit, offset]);
  
  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setOffsetState(Math.max(0, offset - limit));
    }
  }, [hasPreviousPage, limit, offset]);
  
  const setLimit = useCallback((newLimit: number) => {
    // When changing limit, try to stay on the same page
    const currentFirstItem = offset + 1;
    const newPage = Math.ceil(currentFirstItem / newLimit);
    const newOffset = (newPage - 1) * newLimit;
    
    setLimitState(newLimit);
    setOffsetState(newOffset);
  }, [offset]);
  
  const getPaginationParams = useCallback(() => {
    return { limit, offset };
  }, [limit, offset]);
  
  return [
    { limit, offset, currentPage, pageCount, hasNextPage, hasPreviousPage },
    { goToPage, nextPage, previousPage, setLimit, getPaginationParams }
  ];
}
