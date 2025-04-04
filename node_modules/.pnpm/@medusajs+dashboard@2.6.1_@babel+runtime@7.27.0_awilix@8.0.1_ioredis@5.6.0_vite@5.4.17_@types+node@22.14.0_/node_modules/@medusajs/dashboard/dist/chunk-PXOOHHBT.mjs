import {
  inventoryItemLevelsQueryKeys,
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

// src/hooks/api/reservations.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var RESERVATION_ITEMS_QUERY_KEY = "reservation_items";
var reservationItemsQueryKeys = queryKeysFactory(
  RESERVATION_ITEMS_QUERY_KEY
);
var useReservationItem = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryKey: reservationItemsQueryKeys.detail(id),
    queryFn: async () => sdk.admin.reservation.retrieve(id, query),
    ...options
  });
  return { ...data, ...rest };
};
var useReservationItems = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.reservation.list(query),
    queryKey: reservationItemsQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useUpdateReservationItem = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.reservation.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemLevelsQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCreateReservationItem = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.reservation.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemLevelsQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteReservationItem = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.reservation.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: inventoryItemLevelsQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  reservationItemsQueryKeys,
  useReservationItem,
  useReservationItems,
  useUpdateReservationItem,
  useCreateReservationItem,
  useDeleteReservationItem
};
