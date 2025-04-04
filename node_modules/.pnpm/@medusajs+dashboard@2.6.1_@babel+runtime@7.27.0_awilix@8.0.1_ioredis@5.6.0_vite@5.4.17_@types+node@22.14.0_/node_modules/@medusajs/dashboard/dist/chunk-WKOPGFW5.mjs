// src/lib/order-item.ts
var getFulfillableQuantity = (item) => {
  return item.quantity - item.detail.fulfilled_quantity;
};

export {
  getFulfillableQuantity
};
