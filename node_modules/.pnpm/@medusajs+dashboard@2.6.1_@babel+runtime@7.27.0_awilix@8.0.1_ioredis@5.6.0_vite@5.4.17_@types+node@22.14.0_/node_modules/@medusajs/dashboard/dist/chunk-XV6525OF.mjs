import {
  returnsQueryKeys
} from "./chunk-VLT6UQCY.mjs";
import {
  ordersQueryKeys
} from "./chunk-6EJHOUIV.mjs";
import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/exchanges.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var EXCHANGES_QUERY_KEY = "exchanges";
var exchangesQueryKeys = queryKeysFactory(EXCHANGES_QUERY_KEY);
var useExchange = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.exchange.retrieve(id, query),
    queryKey: exchangesQueryKeys.detail(id, query),
    ...options
  });
  return { ...data, ...rest };
};
var useExchanges = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.exchange.list(query),
    queryKey: exchangesQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateExchange = (orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.exchange.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: exchangesQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCancelExchange = (id, orderId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.exchange.cancel(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: exchangesQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: exchangesQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useAddExchangeInboundItems = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.exchange.addInboundItems(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateExchangeInboundItem = (id, orderId, options) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }) => {
      return sdk.admin.exchange.updateInboundItem(id, actionId, payload);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useRemoveExchangeInboundItem = (id, orderId, options) => {
  return useMutation({
    mutationFn: (actionId) => sdk.admin.exchange.removeInboundItem(id, actionId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: returnsQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useAddExchangeInboundShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.exchange.addInboundShipping(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateExchangeInboundShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }) => sdk.admin.exchange.updateInboundShipping(id, actionId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteExchangeInboundShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: (actionId) => sdk.admin.exchange.deleteInboundShipping(id, actionId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useAddExchangeOutboundItems = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.exchange.addOutboundItems(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateExchangeOutboundItems = (id, orderId, options) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }) => {
      return sdk.admin.exchange.updateOutboundItem(id, actionId, payload);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useRemoveExchangeOutboundItem = (id, orderId, options) => {
  return useMutation({
    mutationFn: (actionId) => sdk.admin.exchange.removeOutboundItem(id, actionId),
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
var useAddExchangeOutboundShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.exchange.addOutboundShipping(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateExchangeOutboundShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }) => sdk.admin.exchange.updateOutboundShipping(id, actionId, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteExchangeOutboundShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: (actionId) => sdk.admin.exchange.deleteOutboundShipping(id, actionId),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useExchangeConfirmRequest = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.exchange.request(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: returnsQueryKeys.all
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: exchangesQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCancelExchangeRequest = (id, orderId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.exchange.cancelRequest(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: exchangesQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: exchangesQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  useExchange,
  useExchanges,
  useCreateExchange,
  useCancelExchange,
  useAddExchangeInboundItems,
  useUpdateExchangeInboundItem,
  useRemoveExchangeInboundItem,
  useAddExchangeInboundShipping,
  useUpdateExchangeInboundShipping,
  useDeleteExchangeInboundShipping,
  useAddExchangeOutboundItems,
  useUpdateExchangeOutboundItems,
  useRemoveExchangeOutboundItem,
  useAddExchangeOutboundShipping,
  useUpdateExchangeOutboundShipping,
  useDeleteExchangeOutboundShipping,
  useExchangeConfirmRequest,
  useCancelExchangeRequest
};
