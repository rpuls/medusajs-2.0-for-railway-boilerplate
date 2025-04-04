import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/tax-regions.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var TAX_REGIONS_QUERY_KEY = "tax_regions";
var taxRegionsQueryKeys = queryKeysFactory(TAX_REGIONS_QUERY_KEY);
var useTaxRegion = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryKey: taxRegionsQueryKeys.detail(id),
    queryFn: async () => sdk.admin.taxRegion.retrieve(id, query),
    ...options
  });
  return { ...data, ...rest };
};
var useTaxRegions = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.taxRegion.list(query),
    queryKey: taxRegionsQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateTaxRegion = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.taxRegion.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: taxRegionsQueryKeys.all });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteTaxRegion = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.taxRegion.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: taxRegionsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: taxRegionsQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({ queryKey: taxRegionsQueryKeys.details() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  taxRegionsQueryKeys,
  useTaxRegion,
  useTaxRegions,
  useCreateTaxRegion,
  useDeleteTaxRegion
};
