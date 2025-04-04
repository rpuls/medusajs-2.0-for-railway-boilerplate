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

// src/hooks/api/returns.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var RETURNS_QUERY_KEY = "returns";
var returnsQueryKeys = queryKeysFactory(RETURNS_QUERY_KEY);
var useReturn = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.return.retrieve(id, query),
    queryKey: returnsQueryKeys.detail(id, query),
    ...options
  });
  return { ...data, ...rest };
};
var useReturns = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.return.list(query),
    queryKey: returnsQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useInitiateReturn = (orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.return.initiateRequest(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCancelReturn = (id, orderId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.return.cancel(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId),
        refetchType: "all"
        // We want preview to be updated in the cache immediately
      });
      queryClient.invalidateQueries({
        queryKey: returnsQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: returnsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useConfirmReturnRequest = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.return.confirmRequest(id, payload),
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
      queryClient.invalidateQueries({
        queryKey: returnsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCancelReturnRequest = (id, orderId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.return.cancelRequest(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId),
        refetchType: "all"
        // We want preview to be updated in the cache immediately
      });
      queryClient.invalidateQueries({
        queryKey: returnsQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: returnsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useAddReturnItem = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.return.addReturnItem(id, payload),
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
var useUpdateReturnItem = (id, orderId, options) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }) => {
      return sdk.admin.return.updateReturnItem(id, actionId, payload);
    },
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
var useRemoveReturnItem = (id, orderId, options) => {
  return useMutation({
    mutationFn: (actionId) => sdk.admin.return.removeReturnItem(id, actionId),
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
var useUpdateReturn = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => {
      return sdk.admin.return.updateRequest(id, payload);
    },
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
var useAddReturnShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.return.addReturnShipping(id, payload),
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
var useUpdateReturnShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }) => sdk.admin.return.updateReturnShipping(id, actionId, payload),
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
var useDeleteReturnShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: (actionId) => sdk.admin.return.deleteReturnShipping(id, actionId),
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
var useInitiateReceiveReturn = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.return.initiateReceive(id, payload),
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
var useAddReceiveItems = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.return.receiveItems(id, payload),
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
var useUpdateReceiveItem = (id, orderId, options) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }) => {
      return sdk.admin.return.updateReceiveItem(id, actionId, payload);
    },
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
var useRemoveReceiveItems = (id, orderId, options) => {
  return useMutation({
    mutationFn: (actionId) => {
      return sdk.admin.return.removeReceiveItem(id, actionId);
    },
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
var useAddDismissItems = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.return.dismissItems(id, payload),
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
var useUpdateDismissItem = (id, orderId, options) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }) => {
      return sdk.admin.return.updateDismissItem(id, actionId, payload);
    },
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
var useRemoveDismissItem = (id, orderId, options) => {
  return useMutation({
    mutationFn: (actionId) => {
      return sdk.admin.return.removeDismissItem(id, actionId);
    },
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
var useConfirmReturnReceive = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.return.confirmReceive(id, payload),
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
      queryClient.invalidateQueries({
        queryKey: returnsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCancelReceiveReturn = (id, orderId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.return.cancelReceive(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId),
        refetchType: "all"
        // We want preview to be updated in the cache immediately
      });
      queryClient.invalidateQueries({
        queryKey: returnsQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: returnsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  returnsQueryKeys,
  useReturn,
  useReturns,
  useInitiateReturn,
  useCancelReturn,
  useConfirmReturnRequest,
  useCancelReturnRequest,
  useAddReturnItem,
  useUpdateReturnItem,
  useRemoveReturnItem,
  useUpdateReturn,
  useAddReturnShipping,
  useUpdateReturnShipping,
  useDeleteReturnShipping,
  useInitiateReceiveReturn,
  useAddReceiveItems,
  useUpdateReceiveItem,
  useRemoveReceiveItems,
  useAddDismissItems,
  useUpdateDismissItem,
  useRemoveDismissItem,
  useConfirmReturnReceive,
  useCancelReceiveReturn
};
