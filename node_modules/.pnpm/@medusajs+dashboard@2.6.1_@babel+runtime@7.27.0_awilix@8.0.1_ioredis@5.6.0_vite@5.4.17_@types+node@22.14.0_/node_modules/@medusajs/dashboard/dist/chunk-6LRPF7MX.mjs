import {
  i18n
} from "./chunk-4SVUQSQ5.mjs";

// src/lib/promotions.ts
var promotionStatusMap = {
  ["ACTIVE" /* ACTIVE */]: ["green", i18n.t("statuses.active")],
  ["INACTIVE" /* INACTIVE */]: ["red", i18n.t("statuses.inactive")],
  ["DRAFT" /* DRAFT */]: ["grey", i18n.t("statuses.draft")],
  ["SCHEDULED" /* SCHEDULED */]: [
    "orange",
    `${i18n.t("promotions.fields.campaign")} ${i18n.t("statuses.scheduled").toLowerCase()}`
  ],
  ["EXPIRED" /* EXPIRED */]: [
    "red",
    `${i18n.t("promotions.fields.campaign")} ${i18n.t("statuses.expired").toLowerCase()}`
  ]
};
var getPromotionStatus = (promotion) => {
  const date = /* @__PURE__ */ new Date();
  const campaign = promotion.campaign;
  if (!campaign) {
    return promotionStatusMap[promotion.status.toUpperCase()];
  }
  if (campaign.starts_at && new Date(campaign.starts_at) > date) {
    return promotionStatusMap["SCHEDULED" /* SCHEDULED */];
  }
  const campaignBudget = campaign.budget;
  const overBudget = campaignBudget && campaignBudget.used > campaignBudget.limit;
  if (campaign.ends_at && new Date(campaign.ends_at) < date || overBudget) {
    return promotionStatusMap["EXPIRED" /* EXPIRED */];
  }
  return promotionStatusMap[promotion.status.toUpperCase()];
};

export {
  getPromotionStatus
};
