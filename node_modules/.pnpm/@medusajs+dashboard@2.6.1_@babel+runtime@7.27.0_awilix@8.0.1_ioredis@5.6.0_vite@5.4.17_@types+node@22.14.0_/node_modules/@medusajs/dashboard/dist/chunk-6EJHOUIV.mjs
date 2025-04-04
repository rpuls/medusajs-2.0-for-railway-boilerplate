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
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/orders.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var ORDERS_QUERY_KEY = "orders";
var _orderKeys = queryKeysFactory(ORDERS_QUERY_KEY);
_orderKeys.preview = function(id) {
  return [this.detail(id), "preview"];
};
_orderKeys.changes = function(id) {
  return [this.detail(id), "changes"];
};
_orderKeys.lineItems = function(id) {
  return [this.detail(id), "lineItems"];
};
var ordersQueryKeys = _orderKeys;
var useOrder = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.order.retrieve(id, query),
    queryKey: ordersQueryKeys.detail(id, query),
    ...options
  });
  return { ...data, ...rest };
};
var useUpdateOrder = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.order.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.changes(id)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useOrderPreview = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.order.retrievePreview(id, query),
    queryKey: ordersQueryKeys.preview(id),
    ...options
  });
  return { ...data, ...rest };
};
var useOrders = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.order.list(query),
    queryKey: ordersQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useOrderChanges = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.order.listChanges(id, query),
    queryKey: ordersQueryKeys.changes(id),
    ...options
  });
  return { ...data, ...rest };
};
var useOrderLineItems = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.order.listLineItems(id, query),
    queryKey: ordersQueryKeys.lineItems(id),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateOrderFulfillment = (orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.order.createFulfillment(orderId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.all
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCancelOrderFulfillment = (orderId, fulfillmentId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.order.cancelFulfillment(orderId, fulfillmentId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.all
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCreateOrderShipment = (orderId, fulfillmentId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.order.createShipment(orderId, fulfillmentId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.all
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useMarkOrderFulfillmentAsDelivered = (orderId, fulfillmentId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.order.markAsDelivered(orderId, fulfillmentId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.all
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCancelOrder = (orderId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.order.cancel(orderId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useRequestTransferOrder = (orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.order.requestTransfer(orderId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.changes(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCancelOrderTransfer = (orderId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.order.cancelTransfer(orderId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.changes(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  ordersQueryKeys,
  useOrder,
  useUpdateOrder,
  useOrderPreview,
  useOrders,
  useOrderChanges,
  useOrderLineItems,
  useCreateOrderFulfillment,
  useCancelOrderFulfillment,
  useCreateOrderShipment,
  useMarkOrderFulfillmentAsDelivered,
  useCancelOrder,
  useRequestTransferOrder,
  useCancelOrderTransfer
};
