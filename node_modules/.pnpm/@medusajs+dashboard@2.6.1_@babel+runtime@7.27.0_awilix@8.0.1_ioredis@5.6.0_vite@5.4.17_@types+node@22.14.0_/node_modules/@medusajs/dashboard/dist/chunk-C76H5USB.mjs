// src/hooks/use-query-params.tsx
import { useSearchParams } from "react-router-dom";
function useQueryParams(keys, prefix) {
  const [params] = useSearchParams();
  const result = {};
  keys.forEach((key) => {
    const prefixedKey = prefix ? `${prefix}_${key}` : key;
    const value = params.get(prefixedKey) || void 0;
    result[key] = value;
  });
  return result;
}

export {
  useQueryParams
};
