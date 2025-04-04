import {
  taxRegionsQueryKeys
} from "./chunk-VJRTPNEA.mjs";
import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/tax-rates.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var TAX_RATES_QUERY_KEY = "tax_rates";
var taxRatesQueryKeys = queryKeysFactory(TAX_RATES_QUERY_KEY);
var useTaxRate = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryKey: taxRatesQueryKeys.detail(id),
    queryFn: async () => sdk.admin.taxRate.retrieve(id, query),
    ...options
  });
  return { ...data, ...rest };
};
var useTaxRates = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.taxRate.list(query),
    queryKey: taxRatesQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useUpdateTaxRate = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.taxRate.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: taxRatesQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: taxRatesQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({ queryKey: taxRegionsQueryKeys.details() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCreateTaxRate = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.taxRate.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: taxRatesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taxRegionsQueryKeys.details() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteTaxRate = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.taxRate.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: taxRatesQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: taxRatesQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({ queryKey: taxRegionsQueryKeys.details() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  useTaxRate,
  useTaxRates,
  useUpdateTaxRate,
  useCreateTaxRate,
  useDeleteTaxRate
};
