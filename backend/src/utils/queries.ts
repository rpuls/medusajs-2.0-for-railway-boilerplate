import { Response } from "@medusajs/medusa-js";
import { QueryKey, UseQueryOptions } from "@tanstack/react-query";

type UseQueryOptionsWrapper<TData, TError, TQueryKey> = {
  runOnMount?: boolean; // Add an enabled option here
  // Include any other options you may need later
};

import { useCallback, useEffect, useState } from "react";

export const useFetch = <TQuery extends Record<string, any>, TResponse = any>(
  path: string,
  queryKey: QueryKey, // Keeping this if you plan to use it in future for caching or reactivity
  initialQuery?: TQuery,
  options?: UseQueryOptionsWrapper<Response<TResponse>, Error, QueryKey>
) => {
  const { runOnMount = true } = options || {};
  const [data, setData] = useState<Response<TResponse> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Store the current query in state so we can dynamically update it via refetch
  const [currentQuery, setCurrentQuery] = useState<TQuery | undefined>(
    initialQuery
  );

  const stableQueryKey = JSON.stringify(queryKey);

  const fetchData = useCallback(
    async (queryToUse?: TQuery) => {
      setIsLoading(true);
      setError(null);
      try {
        // Use queryToUse if provided, otherwise fallback to currentQuery
        const effectiveQuery = queryToUse ?? currentQuery;
        const queryFiltered = Object.fromEntries(
          Object.entries(effectiveQuery).filter(([_, v]) => v !== undefined)
        );

        const response = await fetch(
          `${path}?${new URLSearchParams(queryFiltered)}`
        );

        // if (response.redirected) {
        //   window.location.href = response.url;
        // }

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [path, currentQuery, stableQueryKey]
  );

  const refetch = useCallback(
    (newQuery?: TQuery) => {
      if (newQuery) {
        setCurrentQuery(newQuery);
        fetchData(newQuery);
      } else {
        // If no new query provided, use the current one
        fetchData();
      }
    },
    [fetchData]
  );

  useEffect(() => {
    if (runOnMount) {
      fetchData();
    }
  }, [fetchData]);

  return {
    isLoading,
    data,
    error,
    isError: !!error,
    refetch,
  };
};

export const useFetchPost = <
  TQuery extends Record<string, any>,
  TResponse = any
>(
  path: string,
  queryKey: QueryKey,
  defaultQuery?: TQuery
) => {
  const mutate = useCallback(
    async (
      params?: TQuery,
      options?: {
        onSuccess?: ({ response }: { response: any }) => void;
        onError?: (error: Error) => void;
      }
    ) => {
      const { onSuccess, onError } = options || {};

      try {
        const response = await fetch(path, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...defaultQuery, ...params }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        if (onSuccess) {
          onSuccess({ response });
        }
      } catch (error) {
        if (onError) {
          onError(error as Error);
        }
      }
    },
    [path, queryKey, defaultQuery]
  );

  return { mutate };
};

export type VoidQuery = {};

export type VoidResponse = {};
