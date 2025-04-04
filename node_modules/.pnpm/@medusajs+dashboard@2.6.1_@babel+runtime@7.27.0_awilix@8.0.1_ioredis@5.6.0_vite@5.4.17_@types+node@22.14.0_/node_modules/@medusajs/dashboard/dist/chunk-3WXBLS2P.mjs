// src/lib/percentage-helpers.ts
var formatter = new Intl.NumberFormat([], {
  style: "percent",
  minimumFractionDigits: 2
});
var formatPercentage = (value, isPercentageValue = false) => {
  let val = value || 0;
  if (!isPercentageValue) {
    val = val / 100;
  }
  return formatter.format(val);
};

export {
  formatPercentage
};
