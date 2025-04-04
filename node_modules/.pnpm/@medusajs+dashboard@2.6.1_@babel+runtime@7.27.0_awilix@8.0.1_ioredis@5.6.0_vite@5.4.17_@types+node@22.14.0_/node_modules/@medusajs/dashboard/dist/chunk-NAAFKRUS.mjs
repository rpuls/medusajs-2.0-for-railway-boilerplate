import {
  ordersQueryKeys
} from "./chunk-6EJHOUIV.mjs";
import {
  reservationItemsQueryKeys
} from "./chunk-PXOOHHBT.mjs";
import {
  inventoryItemsQueryKeys
} from "./chunk-KPNKJVW6.mjs";
import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/order-edits.tsx
import { useMutation } from "@tanstack/react-query";
var useCreateOrderEdit = (orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.orderEdit.initiateRequest(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useRequestOrderEdit = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.orderEdit.request(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.changes(id)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lineItems(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useConfirmOrderEdit = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.orderEdit.confirm(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.changes(id)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lineItems(id)
      });
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCancelOrderEdit = (orderId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.orderEdit.cancelRequest(orderId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.changes(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lineItems(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useAddOrderEditItems = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.orderEdit.addItems(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateOrderEditOriginalItem = (id, options) => {
  return useMutation({
    mutationFn: ({
      itemId,
      ...payload
    }) => {
      return sdk.admin.orderEdit.updateOriginalItem(id, itemId, payload);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateOrderEditAddedItem = (id, options) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }) => {
      return sdk.admin.orderEdit.updateAddedItem(id, actionId, payload);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useRemoveOrderEditItem = (id, options) => {
  return useMutation({
    mutationFn: (actionId) => sdk.admin.orderEdit.removeAddedItem(id, actionId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  useCreateOrderEdit,
  useRequestOrderEdit,
  useConfirmOrderEdit,
  useCancelOrderEdit,
  useAddOrderEditItems,
  useUpdateOrderEditOriginalItem,
  useUpdateOrderEditAddedItem,
  useRemoveOrderEditItem
};
