// src/hooks/use-combobox-data.tsx
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery
} from "@tanstack/react-query";

// src/hooks/use-debounced-search.tsx
import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";
var useDebouncedSearch = () => {
  const [searchValue, onSearchValueChange] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debouncedUpdate = useCallback(
    debounce((query) => setDebouncedQuery(query), 300),
    []
  );
  useEffect(() => {
    debouncedUpdate(searchValue);
    return () => debouncedUpdate.cancel();
  }, [searchValue, debouncedUpdate]);
  return {
    searchValue,
    onSearchValueChange,
    query: debouncedQuery || void 0
  };
};

// src/hooks/use-combobox-data.tsx
var useComboboxData = ({
  queryKey,
  queryFn,
  getOptions,
  defaultValue,
  defaultValueKey,
  pageSize = 10
}) => {
  const { searchValue, onSearchValueChange, query } = useDebouncedSearch();
  const queryInitialDataBy = defaultValueKey || "id";
  const { data: initialData } = useQuery({
    queryKey,
    queryFn: async () => {
      return queryFn({
        [queryInitialDataBy]: defaultValue,
        limit: Array.isArray(defaultValue) ? defaultValue.length : 1
      });
    },
    enabled: !!defaultValue
  });
  const { data, ...rest } = useInfiniteQuery({
    queryKey: [...queryKey, query],
    queryFn: async ({ pageParam = 0 }) => {
      return await queryFn({
        q: query,
        limit: pageSize,
        offset: pageParam
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const moreItemsExist = lastPage.count > lastPage.offset + lastPage.limit;
      return moreItemsExist ? lastPage.offset + lastPage.limit : void 0;
    },
    placeholderData: keepPreviousData
  });
  const options = data?.pages.flatMap((page) => getOptions(page)) ?? [];
  const defaultOptions = initialData ? getOptions(initialData) : [];
  const disabled = !rest.isPending && !options.length && !searchValue;
  if (defaultValue && defaultOptions.length && !searchValue) {
    defaultOptions.forEach((option) => {
      if (!options.find((o) => o.value === option.value)) {
        options.unshift(option);
      }
    });
  }
  return {
    options,
    searchValue,
    onSearchValueChange,
    disabled,
    ...rest
  };
};

export {
  useDebouncedSearch,
  useComboboxData
};
