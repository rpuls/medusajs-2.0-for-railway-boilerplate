import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/product-types.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var PRODUCT_TYPES_QUERY_KEY = "product_types";
var productTypesQueryKeys = queryKeysFactory(PRODUCT_TYPES_QUERY_KEY);
var useProductType = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.productType.retrieve(id, query),
    queryKey: productTypesQueryKeys.detail(id),
    ...options
  });
  return { ...data, ...rest };
};
var useProductTypes = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.productType.list(query),
    queryKey: productTypesQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateProductType = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.productType.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: productTypesQueryKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateProductType = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.productType.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: productTypesQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({ queryKey: productTypesQueryKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteProductType = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.productType.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: productTypesQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({ queryKey: productTypesQueryKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  productTypesQueryKeys,
  useProductType,
  useProductTypes,
  useCreateProductType,
  useUpdateProductType,
  useDeleteProductType
};
