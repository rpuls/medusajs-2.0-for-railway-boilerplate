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

// src/hooks/api/sales-channels.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var SALES_CHANNELS_QUERY_KEY = "sales-channels";
var salesChannelsQueryKeys = queryKeysFactory(SALES_CHANNELS_QUERY_KEY);
var useSalesChannel = (id, options) => {
  const { data, ...rest } = useQuery({
    queryKey: salesChannelsQueryKeys.detail(id),
    queryFn: async () => sdk.admin.salesChannel.retrieve(id),
    ...options
  });
  return { ...data, ...rest };
};
var useSalesChannels = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.salesChannel.list(query),
    queryKey: salesChannelsQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateSalesChannel = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.salesChannel.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateSalesChannel = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.salesChannel.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.detail(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteSalesChannel = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.salesChannel.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.all
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteSalesChannelLazy = (options) => {
  return useMutation({
    mutationFn: (id) => sdk.admin.salesChannel.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.detail(variables)
      });
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.all
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useSalesChannelRemoveProducts = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.salesChannel.batchProducts(id, { remove: payload }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.detail(id)
      });
      for (const product of variables || []) {
        queryClient.invalidateQueries({
          queryKey: productsQueryKeys.detail(product)
        });
      }
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useSalesChannelAddProducts = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.salesChannel.batchProducts(id, { add: payload }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: salesChannelsQueryKeys.detail(id)
      });
      for (const product of variables || []) {
        queryClient.invalidateQueries({
          queryKey: productsQueryKeys.detail(product)
        });
      }
      queryClient.invalidateQueries({
        queryKey: productsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  salesChannelsQueryKeys,
  useSalesChannel,
  useSalesChannels,
  useCreateSalesChannel,
  useUpdateSalesChannel,
  useDeleteSalesChannel,
  useDeleteSalesChannelLazy,
  useSalesChannelRemoveProducts,
  useSalesChannelAddProducts
};
