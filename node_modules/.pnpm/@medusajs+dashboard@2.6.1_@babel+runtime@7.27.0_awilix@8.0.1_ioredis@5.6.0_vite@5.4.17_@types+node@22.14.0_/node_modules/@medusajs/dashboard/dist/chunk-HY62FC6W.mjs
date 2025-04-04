import {
  salesChannelsQueryKeys
} from "./chunk-GX3K52WA.mjs";
import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/api-keys.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var API_KEYS_QUERY_KEY = "api_keys";
var apiKeysQueryKeys = queryKeysFactory(API_KEYS_QUERY_KEY);
var useApiKey = (id, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.apiKey.retrieve(id),
    queryKey: apiKeysQueryKeys.detail(id),
    ...options
  });
  return { ...data, ...rest };
};
var useApiKeys = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.apiKey.list(query),
    queryKey: apiKeysQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateApiKey = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.apiKey.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateApiKey = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.apiKey.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKeys.detail(id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useRevokeApiKey = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.apiKey.revoke(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKeys.detail(id) });
      options?.onSuccess?.(data, variables, context);
    }
  });
};
var useDeleteApiKey = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.apiKey.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKeys.detail(id) });
      options?.onSuccess?.(data, variables, context);
    }
  });
};
var useBatchRemoveSalesChannelsFromApiKey = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.apiKey.batchSalesChannels(id, { remove: payload }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKeys.detail(id) });
      queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useBatchAddSalesChannelsToApiKey = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.apiKey.batchSalesChannels(id, { add: payload }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: apiKeysQueryKeys.detail(id) });
      queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  apiKeysQueryKeys,
  useApiKey,
  useApiKeys,
  useCreateApiKey,
  useUpdateApiKey,
  useRevokeApiKey,
  useDeleteApiKey,
  useBatchRemoveSalesChannelsFromApiKey,
  useBatchAddSalesChannelsToApiKey
};
