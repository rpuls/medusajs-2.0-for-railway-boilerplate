import {
  pricePreferencesQueryKeys
} from "./chunk-HYULYW73.mjs";
import {
  queryClient
} from "./chunk-FXYH54JP.mjs";
import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/store.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
import { FetchError } from "@medusajs/js-sdk";
var STORE_QUERY_KEY = "store";
var storeQueryKeys = queryKeysFactory(STORE_QUERY_KEY);
async function retrieveActiveStore(query) {
  const response = await sdk.admin.store.list(query);
  const activeStore = response.stores?.[0];
  if (!activeStore) {
    throw new FetchError("No active store found", "Not Found", 404);
  }
  return { store: activeStore };
}
var useStore = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => retrieveActiveStore(query),
    queryKey: storeQueryKeys.details(),
    ...options
  });
  return {
    ...data,
    ...rest
  };
};
var useUpdateStore = (id, options) => {
  return useMutation({
    mutationFn: (payload) => sdk.admin.store.update(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: pricePreferencesQueryKeys.list()
      });
      queryClient.invalidateQueries({
        queryKey: pricePreferencesQueryKeys.details()
      });
      queryClient.invalidateQueries({ queryKey: storeQueryKeys.details() });
      options?.onSuccess?.(data, variables, context);
    },
    ...options
  });
};

export {
  storeQueryKeys,
  retrieveActiveStore,
  useStore,
  useUpdateStore
};
