import {
  shippingOptionsQueryKeys
} from "./chunk-BF3VCHXD.mjs";
import {
  stockLocationsQueryKeys
} from "./chunk-QDC5CTTV.mjs";
import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/fulfillment-sets.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var FULFILLMENT_SETS_QUERY_KEY = "fulfillment_sets";
var fulfillmentSetsQueryKeys = queryKeysFactory(
  FULFILLMENT_SETS_QUERY_KEY
);
var useDeleteFulfillmentSet = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.fulfillmentSet.delete(id),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: fulfillmentSetsQueryKeys.detail(id)
      });
      await queryClient.invalidateQueries({
        queryKey: fulfillmentSetsQueryKeys.lists()
      });
      await queryClient.invalidateQueries({
        queryKey: stockLocationsQueryKeys.all
      });
      await queryClient.invalidateQueries({
        queryKey: shippingOptionsQueryKeys.all
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCreateFulfillmentSetServiceZone = (fulfillmentSetId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.fulfillmentSet.createServiceZone(fulfillmentSetId, payload),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: fulfillmentSetsQueryKeys.lists()
      });
      await queryClient.invalidateQueries({
        queryKey: stockLocationsQueryKeys.all
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateFulfillmentSetServiceZone = (fulfillmentSetId, serviceZoneId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.fulfillmentSet.updateServiceZone(
      fulfillmentSetId,
      serviceZoneId,
      payload
    ),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: fulfillmentSetsQueryKeys.lists()
      });
      await queryClient.invalidateQueries({
        queryKey: stockLocationsQueryKeys.all
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteFulfillmentServiceZone = (fulfillmentSetId, serviceZoneId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.fulfillmentSet.deleteServiceZone(
      fulfillmentSetId,
      serviceZoneId
    ),
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: fulfillmentSetsQueryKeys.lists()
      });
      await queryClient.invalidateQueries({
        queryKey: shippingOptionsQueryKeys.lists()
      });
      await queryClient.invalidateQueries({
        queryKey: stockLocationsQueryKeys.all
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  useDeleteFulfillmentSet,
  useCreateFulfillmentSetServiceZone,
  useUpdateFulfillmentSetServiceZone,
  useDeleteFulfillmentServiceZone
};
