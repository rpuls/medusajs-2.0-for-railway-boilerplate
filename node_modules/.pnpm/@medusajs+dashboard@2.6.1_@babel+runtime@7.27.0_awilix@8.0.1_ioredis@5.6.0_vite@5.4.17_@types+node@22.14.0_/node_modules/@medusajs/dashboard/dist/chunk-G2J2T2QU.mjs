import {
  castNumber
} from "./chunk-6GU6IDUA.mjs";

// src/routes/price-lists/common/utils.ts
import { json } from "react-router-dom";
var getValues = (priceList) => {
  const startsAt = priceList.starts_at;
  const endsAt = priceList.ends_at;
  const isExpired = endsAt ? new Date(endsAt) < /* @__PURE__ */ new Date() : false;
  const isScheduled = startsAt ? new Date(startsAt) > /* @__PURE__ */ new Date() : false;
  const isDraft = priceList.status === "draft" /* DRAFT */;
  return {
    isExpired,
    isScheduled,
    isDraft
  };
};
var getPriceListStatus = (t, priceList) => {
  const { isExpired, isScheduled, isDraft } = getValues(priceList);
  let text = t("priceLists.fields.status.options.active");
  let color = "green";
  let status = "active" /* ACTIVE */;
  if (isDraft) {
    color = "grey";
    text = t("priceLists.fields.status.options.draft");
    status = "draft" /* DRAFT */;
  }
  if (isExpired) {
    color = "red";
    text = t("priceLists.fields.status.options.expired");
    status = "expired" /* EXPIRED */;
  }
  if (isScheduled) {
    color = "orange";
    text = t("priceLists.fields.status.options.scheduled");
    status = "scheduled" /* SCHEDULED */;
  }
  return {
    color,
    text,
    status
  };
};
var isProductRow = (row) => {
  return "variants" in row;
};
var extractPricesFromVariants = (variantId, variant, regions) => {
  const extractPriceDetails = (price, priceType, id) => {
    const currencyCode = priceType === "currency" ? id : regions.find((r) => r.id === id)?.currency_code;
    if (!currencyCode) {
      throw json({ message: "Currency code not found" }, 400);
    }
    return {
      amount: castNumber(price.amount),
      ...priceType === "region" ? { rules: { region_id: id } } : {},
      currency_code: currencyCode,
      variant_id: variantId
    };
  };
  const currencyPrices = Object.entries(variant.currency_prices || {}).flatMap(
    ([currencyCode, currencyPrice]) => {
      return currencyPrice?.amount ? [extractPriceDetails(currencyPrice, "currency", currencyCode)] : [];
    }
  );
  const regionPrices = Object.entries(variant.region_prices || {}).flatMap(
    ([regionId, regionPrice]) => {
      return regionPrice?.amount ? [extractPriceDetails(regionPrice, "region", regionId)] : [];
    }
  );
  return [...currencyPrices, ...regionPrices];
};
var exctractPricesFromProducts = (products, regions) => {
  return Object.values(products).flatMap(
    ({ variants }) => Object.entries(variants).flatMap(
      ([variantId, variant]) => extractPricesFromVariants(variantId, variant, regions)
    )
  );
};

export {
  getPriceListStatus,
  isProductRow,
  exctractPricesFromProducts
};
