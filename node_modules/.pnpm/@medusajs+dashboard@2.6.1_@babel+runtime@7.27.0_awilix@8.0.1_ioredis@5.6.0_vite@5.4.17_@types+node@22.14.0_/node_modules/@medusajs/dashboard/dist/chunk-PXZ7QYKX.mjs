// src/lib/rma.ts
function getReturnableQuantity(item) {
  const {
    delivered_quantity,
    return_received_quantity,
    return_dismissed_quantity,
    return_requested_quantity
  } = item.detail;
  return delivered_quantity - (return_received_quantity + return_requested_quantity + return_dismissed_quantity);
}

export {
  getReturnableQuantity
};
