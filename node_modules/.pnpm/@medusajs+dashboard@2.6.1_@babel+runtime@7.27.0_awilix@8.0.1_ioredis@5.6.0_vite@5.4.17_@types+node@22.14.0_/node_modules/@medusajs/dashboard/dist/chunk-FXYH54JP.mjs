// src/lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";
var MEDUSA_BACKEND_URL = __BACKEND_URL__ ?? "/";
var queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 9e4,
      retry: 1
    }
  }
});

export {
  queryClient
};
