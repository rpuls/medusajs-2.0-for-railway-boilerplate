import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/invites.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var INVITES_QUERY_KEY = "invites";
var invitesQueryKeys = queryKeysFactory(INVITES_QUERY_KEY);
var useInvites = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.invite.list(query),
    queryKey: invitesQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};
var useCreateInvite = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.invite.create(payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: invitesQueryKeys.lists() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useResendInvite = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.invite.resend(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: invitesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invitesQueryKeys.detail(id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useDeleteInvite = (id, options) => {
  return useMutation({
    mutationFn: () => sdk.admin.invite.delete(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: invitesQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: invitesQueryKeys.detail(id) });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useAcceptInvite = (inviteToken, options) => {
  return useMutation({
    mutationFn: (payload) => {
      const { auth_token, ...rest } = payload;
      return sdk.admin.invite.accept(
        { invite_token: inviteToken, ...rest },
        {},
        {
          Authorization: `Bearer ${auth_token}`
        }
      );
    },
    onSuccess: (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  useInvites,
  useCreateInvite,
  useResendInvite,
  useDeleteInvite,
  useAcceptInvite
};
