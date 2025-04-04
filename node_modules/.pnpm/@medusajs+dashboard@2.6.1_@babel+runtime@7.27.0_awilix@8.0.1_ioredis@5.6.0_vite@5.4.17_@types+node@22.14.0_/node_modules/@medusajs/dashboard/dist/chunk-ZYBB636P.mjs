import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/return-reasons.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var RETURN_REASONS_QUERY_KEY = "return_reasons";
var returnReasonsQueryKeys = queryKeysFactory(RETURN_REASONS_QUERY_KEY);
var useReturnReasons = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.returnReason.list(query),
    queryKey: returnReasonsQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useReturnReason = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.returnReason.retrieve(id, query),
    queryKey: returnReasonsQueryKeys.detail(id),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateReturnReason = (query, options) => {
  return useMutation({
    mutationFn: async (data) => sdk.admin.returnReason.create(data, query),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: returnReasonsQueryKeys.lists()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useUpdateReturnReason = (id, query, options) => {
  return useMutation({
    mutationFn: async (data) => sdk.admin.returnReason.update(id, data, query),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: returnReasonsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: returnReasonsQueryKeys.detail(data.return_reason.id, query)
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteReturnReason = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.returnReason.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: returnReasonsQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: returnReasonsQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({
        queryKey: returnReasonsQueryKeys.details()
      });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  returnReasonsQueryKeys,
  useReturnReasons,
  useReturnReason,
  useCreateReturnReason,
  useUpdateReturnReason,
  useDeleteReturnReason
};
