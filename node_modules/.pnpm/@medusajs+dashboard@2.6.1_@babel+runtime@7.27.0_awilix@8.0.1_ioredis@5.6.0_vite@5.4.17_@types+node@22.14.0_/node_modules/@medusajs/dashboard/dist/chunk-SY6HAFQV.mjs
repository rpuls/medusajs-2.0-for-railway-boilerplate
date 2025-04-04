import {
  pricePreferencesQueryKeys
} from "./chunk-HYULYW73.mjs";
import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/regions.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var REGIONS_QUERY_KEY = "regions";
var regionsQueryKeys = queryKeysFactory(REGIONS_QUERY_KEY);
var useRegion = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryKey: regionsQueryKeys.detail(id, query),
    queryFn: async () => sdk.admin.region.retrieve(id, query),
    ...options
  });
  return { ...data, ...rest };
};
var useRegions = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.region.list(query),
    queryKey: regionsQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateRegion = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.region.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: regionsQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: pricePreferencesQueryKeys.list()
      });
      queryClient.invalidateQueries({
        queryKey: pricePreferencesQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateRegion = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.region.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: regionsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: regionsQueryKeys.details() });
      queryClient.invalidateQueries({
        queryKey: pricePreferencesQueryKeys.list()
      });
      queryClient.invalidateQueries({
        queryKey: pricePreferencesQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteRegion = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.region.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: regionsQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: regionsQueryKeys.detail(id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  regionsQueryKeys,
  useRegion,
  useRegions,
  useCreateRegion,
  useUpdateRegion,
  useDeleteRegion
};
