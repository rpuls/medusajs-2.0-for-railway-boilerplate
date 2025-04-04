// src/lib/format-currency.ts
var formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    signDisplay: "auto"
  }).format(amount);
};

export {
  formatCurrency
};
