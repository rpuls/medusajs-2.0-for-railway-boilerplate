// src/lib/is-fetch-error.ts
import { FetchError } from "@medusajs/js-sdk";
var isFetchError = (error) => {
  return error instanceof FetchError;
};

export {
  isFetchError
};
