import {
  queryKeysFactory
} from "./chunk-774WSTCC.mjs";
import {
  sdk
} from "./chunk-WAYDNCEG.mjs";

// src/hooks/api/currencies.tsx
import { useQuery } from "@tanstack/react-query";
var CURRENCIES_QUERY_KEY = "currencies";
var currenciesQueryKeys = queryKeysFactory(CURRENCIES_QUERY_KEY);
var useCurrencies = (query, options) => {
  const { data, ...rest } = useQuery({
    queryFn: () => sdk.admin.currency.list(query),
    queryKey: currenciesQueryKeys.list(query),
    ...options
  });
  return { ...data, ...rest };
};

export {
  useCurrencies
};
