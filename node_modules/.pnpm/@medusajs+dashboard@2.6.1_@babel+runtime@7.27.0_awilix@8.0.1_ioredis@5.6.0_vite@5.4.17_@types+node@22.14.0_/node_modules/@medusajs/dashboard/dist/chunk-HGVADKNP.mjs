import {
  customerGroupsQueryKeys
} from "./chunk-S3MWIWV4.mjs";
import {
  productsQueryKeys
} from "./chunk-KPNKJVW6.mjs";
import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/price-lists.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var PRICE_LISTS_QUERY_KEY = "price-lists";
var priceListsQueryKeys = queryKeysFactory(PRICE_LISTS_QUERY_KEY);
var usePriceList = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.priceList.retrieve(id, query),
    queryKey: priceListsQueryKeys.detail(id),
    ...options
  });
  return { ...data, ...rest };
};
var usePriceLists = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.priceList.list(query),
    queryKey: priceListsQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreatePriceList = (query, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.priceList.create(payload, query),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: priceListsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerGroupsQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdatePriceList = (id, query, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.priceList.update(id, payload, query),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: priceListsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: priceListsQueryKeys.details()
      });
      queryClient.invalidateQueries({ queryKey: customerGroupsQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeletePriceList = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.priceList.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: priceListsQueryKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useBatchPriceListPrices = (id, query, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.priceList.batchPrices(id, payload, query),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: priceListsQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var usePriceListLinkProducts = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.priceList.linkProducts(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: priceListsQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({ queryKey: priceListsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productsQueryKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  priceListsQueryKeys,
  usePriceList,
  usePriceLists,
  useCreatePriceList,
  useUpdatePriceList,
  useDeletePriceList,
  useBatchPriceListPrices,
  usePriceListLinkProducts
};
