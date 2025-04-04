// src/routes/price-lists/common/constants.ts
var PriceListStatus = /* @__PURE__ */ ((PriceListStatus2) => {
  PriceListStatus2["ACTIVE"] = "active";
  PriceListStatus2["DRAFT"] = "draft";
  return PriceListStatus2;
})(PriceListStatus || {});
var PriceListType = /* @__PURE__ */ ((PriceListType2) => {
  PriceListType2["SALE"] = "sale";
  PriceListType2["OVERRIDE"] = "override";
  return PriceListType2;
})(PriceListType || {});

export {
  PriceListStatus,
  PriceListType
};
