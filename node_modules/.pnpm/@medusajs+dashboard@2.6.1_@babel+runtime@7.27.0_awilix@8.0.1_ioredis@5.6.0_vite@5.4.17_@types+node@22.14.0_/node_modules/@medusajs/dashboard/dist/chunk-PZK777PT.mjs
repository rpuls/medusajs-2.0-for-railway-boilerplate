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

// src/hooks/api/claims.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var CLAIMS_QUERY_KEY = "claims";
var claimsQueryKeys = queryKeysFactory(CLAIMS_QUERY_KEY);
var useClaim = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.claim.retrieve(id, query),
    queryKey: claimsQueryKeys.detail(id, query),
    ...options
  });
  return { ...data, ...rest };
};
var useClaims = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: async () => sdk.admin.claim.list(query),
    queryKey: claimsQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateClaim = (orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.claim.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: claimsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCancelClaim = (id, orderId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.claim.cancel(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: claimsQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: claimsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useAddClaimInboundItems = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.claim.addInboundItems(id, payload),
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
var useUpdateClaimInboundItem = (id, orderId, options) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }) => {
      return sdk.admin.claim.updateInboundItem(id, actionId, payload);
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
var useRemoveClaimInboundItem = (id, orderId, options) => {
  return useMutation({
    mutationFn: (actionId) => sdk.admin.claim.removeInboundItem(id, actionId),
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
var useAddClaimInboundShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.claim.addInboundShipping(id, payload),
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
var useUpdateClaimInboundShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }) => sdk.admin.claim.updateInboundShipping(id, actionId, payload),
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
var useDeleteClaimInboundShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: (actionId) => sdk.admin.claim.deleteInboundShipping(id, actionId),
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
var useAddClaimOutboundItems = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.claim.addOutboundItems(id, payload),
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
var useUpdateClaimOutboundItems = (id, orderId, options) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }) => {
      return sdk.admin.claim.updateOutboundItem(id, actionId, payload);
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
var useRemoveClaimOutboundItem = (id, orderId, options) => {
  return useMutation({
    mutationFn: (actionId) => sdk.admin.claim.removeOutboundItem(id, actionId),
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
var useAddClaimOutboundShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.claim.addOutboundShipping(id, payload),
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
var useUpdateClaimOutboundShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: ({
      actionId,
      ...payload
    }) => sdk.admin.claim.updateOutboundShipping(id, actionId, payload),
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
var useDeleteClaimOutboundShipping = (id, orderId, options) => {
  return useMutation({
    mutationFn: (actionId) => sdk.admin.claim.deleteOutboundShipping(id, actionId),
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
var useClaimConfirmRequest = (id, orderId, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.claim.request(id, payload),
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
        queryKey: claimsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useCancelClaimRequest = (id, orderId, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.claim.cancelRequest(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(orderId)
      });
      queryClient.invalidateQueries({
        queryKey: claimsQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: claimsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  useClaim,
  useClaims,
  useCreateClaim,
  useCancelClaim,
  useAddClaimInboundItems,
  useUpdateClaimInboundItem,
  useRemoveClaimInboundItem,
  useAddClaimInboundShipping,
  useUpdateClaimInboundShipping,
  useDeleteClaimInboundShipping,
  useAddClaimOutboundItems,
  useUpdateClaimOutboundItems,
  useRemoveClaimOutboundItem,
  useAddClaimOutboundShipping,
  useUpdateClaimOutboundShipping,
  useDeleteClaimOutboundShipping,
  useClaimConfirmRequest,
  useCancelClaimRequest
};
