import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/auth.tsx
import { useMutation } from "@tanstack/react-query";
var useSignInWithEmailPass = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.auth.login("user", "emailpass", payload),
    onSuccess: async (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useSignUpWithEmailPass = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.auth.register("user", "emailpass", payload),
    onSuccess: async (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useResetPasswordForEmailPass = (options) => {
  return useMutation({
    mutationFn: (payload) => sdk.auth.resetPassword("user", "emailpass", {
      identifier: payload.email
    }),
    onSuccess: async (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};
var useLogout = (options) => {
  return useMutation({
    mutationFn: () => sdk.auth.logout(),
    ...options
  });
};
var useUpdateProviderForEmailPass = (token, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.auth.updateProvider("user", "emailpass", payload, token),
    onSuccess: async (data, variables, context) => {
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  useSignInWithEmailPass,
  useSignUpWithEmailPass,
  useResetPasswordForEmailPass,
  useLogout,
  useUpdateProviderForEmailPass
};
