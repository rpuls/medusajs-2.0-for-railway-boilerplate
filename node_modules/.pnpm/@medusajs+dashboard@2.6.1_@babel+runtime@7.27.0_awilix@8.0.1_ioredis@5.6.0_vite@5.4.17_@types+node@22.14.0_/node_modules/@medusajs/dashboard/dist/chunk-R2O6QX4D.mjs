// src/lib/shipping-options.ts
function isReturnOption(shippingOption) {
  return !!shippingOption.rules?.find(
    (r) => r.attribute === "is_return" && r.value === "true" && r.operator === "eq"
  );
}
function isOptionEnabledInStore(shippingOption) {
  return !!shippingOption.rules?.find(
    (r) => r.attribute === "enabled_in_store" && r.value === "true" && r.operator === "eq"
  );
}

export {
  isReturnOption,
  isOptionEnabledInStore
};
