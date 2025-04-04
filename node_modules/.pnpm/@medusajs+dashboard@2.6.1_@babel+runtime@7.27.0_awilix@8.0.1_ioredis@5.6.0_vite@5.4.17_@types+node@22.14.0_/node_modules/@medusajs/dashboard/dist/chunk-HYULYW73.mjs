import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/price-preferences.tsx
import {
  useMutation,
  useQuery
} from "@tanstack/react-query";
var PRICE_PREFERENCES_QUERY_KEY = "price-preferences";
var pricePreferencesQueryKeys = queryKeysFactory(
  PRICE_PREFERENCES_QUERY_KEY
);
var usePricePreferences = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.pricePreference.list(query),
    queryKey: pricePreferencesQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};

export {
  pricePreferencesQueryKeys,
  usePricePreferences
};
