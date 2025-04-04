import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/users.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var USERS_QUERY_KEY = "users";
var usersQueryKeys = {
  ...queryKeysFactory(USERS_QUERY_KEY),
  me: () => [USERS_QUERY_KEY, "me"]
};
var useMe = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.user.me(query),
    queryKey: usersQueryKeys.me(),
    ...options
  });
  return {
    ...data,
    ...rest
  };
};
var useUser = (id, query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.user.retrieve(id, query),
    queryKey: usersQueryKeys.detail(id),
    ...options
  });
  return { ...data, ...rest };
};
var useUsers = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.user.list(query),
    queryKey: usersQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useUpdateUser = (id, query, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.user.update(id, payload, query),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.me() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteUser = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.user.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.me() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  useMe,
  useUser,
  useUsers,
  useUpdateUser,
  useDeleteUser
};
