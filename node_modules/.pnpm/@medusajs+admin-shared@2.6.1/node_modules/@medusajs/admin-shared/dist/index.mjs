// src/extensions/custom-fields/product/constants.ts
var PRODUCT_CUSTOM_FIELD_MODEL = "product";
var PRODUCT_CUSTOM_FIELD_FORM_ZONES = [
  "create",
  "edit",
  "organize",
  "attributes"
];
var PRODUCT_CUSTOM_FIELD_CREATE_FORM_TABS = [
  "general",
  "organize"
];
var PRODUCT_CUSTOM_FIELD_FORM_TABS = [
  ...PRODUCT_CUSTOM_FIELD_CREATE_FORM_TABS
];
var PRODUCT_CUSTOM_FIELD_DISPLAY_ZONES = [
  "general",
  "organize",
  "attributes"
];
var PRODUCT_CUSTOM_FIELD_LINK_PATHS = [
  `${PRODUCT_CUSTOM_FIELD_MODEL}.$link`
];
var PRODUCT_CUSTOM_FIELD_FORM_CONFIG_PATHS = [
  ...PRODUCT_CUSTOM_FIELD_FORM_ZONES.map(
    (form) => `${PRODUCT_CUSTOM_FIELD_MODEL}.${form}.$config`
  )
];
var PRODUCT_CUSTOM_FIELD_FORM_FIELD_PATHS = [
  ...PRODUCT_CUSTOM_FIELD_FORM_ZONES.flatMap((form) => {
    return form === "create" ? PRODUCT_CUSTOM_FIELD_CREATE_FORM_TABS.map(
      (tab) => `${PRODUCT_CUSTOM_FIELD_MODEL}.${form}.${tab}.$field`
    ) : [`${PRODUCT_CUSTOM_FIELD_MODEL}.${form}.$field`];
  })
];
var PRODUCT_CUSTOM_FIELD_DISPLAY_PATHS = [
  ...PRODUCT_CUSTOM_FIELD_DISPLAY_ZONES.map(
    (id) => `${PRODUCT_CUSTOM_FIELD_MODEL}.${id}.$display`
  )
];

// src/extensions/custom-fields/constants.ts
var CUSTOM_FIELD_MODELS = [PRODUCT_CUSTOM_FIELD_MODEL];
var CUSTOM_FIELD_CONTAINER_ZONES = [
  ...PRODUCT_CUSTOM_FIELD_DISPLAY_ZONES
];
var CUSTOM_FIELD_FORM_ZONES = [
  ...PRODUCT_CUSTOM_FIELD_FORM_ZONES
];
var CUSTOM_FIELD_FORM_TABS = [
  ...PRODUCT_CUSTOM_FIELD_FORM_TABS
];
var CUSTOM_FIELD_FORM_CONFIG_PATHS = [
  ...PRODUCT_CUSTOM_FIELD_FORM_CONFIG_PATHS
];
var CUSTOM_FIELD_FORM_FIELD_PATHS = [
  ...PRODUCT_CUSTOM_FIELD_FORM_FIELD_PATHS
];
var CUSTOM_FIELD_DISPLAY_PATHS = [
  ...PRODUCT_CUSTOM_FIELD_DISPLAY_PATHS
];
var CUSTOM_FIELD_LINK_PATHS = [
  ...PRODUCT_CUSTOM_FIELD_LINK_PATHS
];

// src/extensions/custom-fields/utils.ts
function isValidCustomFieldModel(id) {
  return CUSTOM_FIELD_MODELS.includes(id);
}
function isValidCustomFieldFormZone(id) {
  return CUSTOM_FIELD_FORM_ZONES.includes(id);
}
function isValidCustomFieldFormTab(id) {
  return CUSTOM_FIELD_FORM_TABS.includes(id);
}
function isValidCustomFieldDisplayZone(id) {
  return CUSTOM_FIELD_CONTAINER_ZONES.includes(id);
}
function isValidCustomFieldDisplayPath(id) {
  return CUSTOM_FIELD_DISPLAY_PATHS.includes(id);
}
function isValidCustomFieldFormConfigPath(id) {
  return CUSTOM_FIELD_FORM_CONFIG_PATHS.includes(id);
}
function isValidCustomFieldFormFieldPath(id) {
  return CUSTOM_FIELD_FORM_FIELD_PATHS.includes(id);
}
function isValidCustomFieldLinkPath(id) {
  return CUSTOM_FIELD_LINK_PATHS.includes(id);
}

// src/extensions/routes/constants.ts
var NESTED_ROUTE_POSITIONS = [
  "/orders",
  "/products",
  "/inventory",
  "/customers",
  "/promotions",
  "/price-lists"
];

// src/extensions/widgets/constants.ts
var ORDER_INJECTION_ZONES = [
  "order.details.before",
  "order.details.after",
  "order.details.side.before",
  "order.details.side.after",
  "order.list.before",
  "order.list.after"
];
var CUSTOMER_INJECTION_ZONES = [
  "customer.details.before",
  "customer.details.after",
  "customer.list.before",
  "customer.list.after"
];
var CUSTOMER_GROUP_INJECTION_ZONES = [
  "customer_group.details.before",
  "customer_group.details.after",
  "customer_group.list.before",
  "customer_group.list.after"
];
var PRODUCT_INJECTION_ZONES = [
  "product.details.before",
  "product.details.after",
  "product.list.before",
  "product.list.after",
  "product.details.side.before",
  "product.details.side.after"
];
var PRODUCT_VARIANT_INJECTION_ZONES = [
  "product_variant.details.before",
  "product_variant.details.after",
  "product_variant.details.side.before",
  "product_variant.details.side.after"
];
var PRODUCT_COLLECTION_INJECTION_ZONES = [
  "product_collection.details.before",
  "product_collection.details.after",
  "product_collection.list.before",
  "product_collection.list.after"
];
var PRODUCT_CATEGORY_INJECTION_ZONES = [
  "product_category.details.before",
  "product_category.details.after",
  "product_category.details.side.before",
  "product_category.details.side.after",
  "product_category.list.before",
  "product_category.list.after"
];
var PRODUCT_TYPE_INJECTION_ZONES = [
  "product_type.details.before",
  "product_type.details.after",
  "product_type.list.before",
  "product_type.list.after"
];
var PRODUCT_TAG_INJECTION_ZONES = [
  "product_tag.details.before",
  "product_tag.details.after",
  "product_tag.list.before",
  "product_tag.list.after"
];
var PRICE_LIST_INJECTION_ZONES = [
  "price_list.details.before",
  "price_list.details.after",
  "price_list.details.side.before",
  "price_list.details.side.after",
  "price_list.list.before",
  "price_list.list.after"
];
var PROMOTION_INJECTION_ZONES = [
  "promotion.details.before",
  "promotion.details.after",
  "promotion.details.side.before",
  "promotion.details.side.after",
  "promotion.list.before",
  "promotion.list.after"
];
var CAMPAIGN_INJECTION_ZONES = [
  "campaign.details.before",
  "campaign.details.after",
  "campaign.details.side.before",
  "campaign.details.side.after",
  "campaign.list.before",
  "campaign.list.after"
];
var USER_INJECTION_ZONES = [
  "user.details.before",
  "user.details.after",
  "user.list.before",
  "user.list.after"
];
var STORE_INJECTION_ZONES = [
  "store.details.before",
  "store.details.after"
];
var PROFILE_INJECTION_ZONES = [
  "profile.details.before",
  "profile.details.after"
];
var REGION_INJECTION_ZONES = [
  "region.details.before",
  "region.details.after",
  "region.list.before",
  "region.list.after"
];
var SHIPPING_PROFILE_INJECTION_ZONES = [
  "shipping_profile.details.before",
  "shipping_profile.details.after",
  "shipping_profile.list.before",
  "shipping_profile.list.after"
];
var LOCATION_INJECTION_ZONES = [
  "location.details.before",
  "location.details.after",
  "location.details.side.before",
  "location.details.side.after",
  "location.list.before",
  "location.list.after"
];
var LOGIN_INJECTION_ZONES = ["login.before", "login.after"];
var SALES_CHANNEL_INJECTION_ZONES = [
  "sales_channel.details.before",
  "sales_channel.details.after",
  "sales_channel.list.before",
  "sales_channel.list.after"
];
var RESERVATION_INJECTION_ZONES = [
  "reservation.details.before",
  "reservation.details.after",
  "reservation.details.side.before",
  "reservation.details.side.after",
  "reservation.list.before",
  "reservation.list.after"
];
var API_KEY_INJECTION_ZONES = [
  "api_key.details.before",
  "api_key.details.after",
  "api_key.list.before",
  "api_key.list.after"
];
var WORKFLOW_INJECTION_ZONES = [
  "workflow.details.before",
  "workflow.details.after",
  "workflow.list.before",
  "workflow.list.after"
];
var TAX_INJECTION_ZONES = [
  "tax.details.before",
  "tax.details.after",
  "tax.list.before",
  "tax.list.after"
];
var RETURN_REASON_INJECTION_ZONES = [
  "return_reason.list.before",
  "return_reason.list.after"
];
var INVENTORY_ITEM_INJECTION_ZONES = [
  "inventory_item.details.before",
  "inventory_item.details.after",
  "inventory_item.details.side.before",
  "inventory_item.details.side.after",
  "inventory_item.list.before",
  "inventory_item.list.after"
];
var INJECTION_ZONES = [
  ...ORDER_INJECTION_ZONES,
  ...CUSTOMER_INJECTION_ZONES,
  ...CUSTOMER_GROUP_INJECTION_ZONES,
  ...PRODUCT_INJECTION_ZONES,
  ...PRODUCT_VARIANT_INJECTION_ZONES,
  ...PRODUCT_COLLECTION_INJECTION_ZONES,
  ...PRODUCT_CATEGORY_INJECTION_ZONES,
  ...PRODUCT_TYPE_INJECTION_ZONES,
  ...PRODUCT_TAG_INJECTION_ZONES,
  ...PRICE_LIST_INJECTION_ZONES,
  ...PROMOTION_INJECTION_ZONES,
  ...USER_INJECTION_ZONES,
  ...STORE_INJECTION_ZONES,
  ...PROFILE_INJECTION_ZONES,
  ...REGION_INJECTION_ZONES,
  ...SHIPPING_PROFILE_INJECTION_ZONES,
  ...LOCATION_INJECTION_ZONES,
  ...LOGIN_INJECTION_ZONES,
  ...SALES_CHANNEL_INJECTION_ZONES,
  ...RESERVATION_INJECTION_ZONES,
  ...API_KEY_INJECTION_ZONES,
  ...WORKFLOW_INJECTION_ZONES,
  ...CAMPAIGN_INJECTION_ZONES,
  ...TAX_INJECTION_ZONES,
  ...RETURN_REASON_INJECTION_ZONES,
  ...INVENTORY_ITEM_INJECTION_ZONES
];

// src/extensions/widgets/utils.ts
function isValidInjectionZone(zone) {
  return INJECTION_ZONES.includes(zone);
}

// src/virtual-modules/constants.ts
var LINK_VIRTUAL_MODULE = `virtual:medusa/links`;
var FORM_VIRTUAL_MODULE = `virtual:medusa/forms`;
var DISPLAY_VIRTUAL_MODULE = `virtual:medusa/displays`;
var ROUTE_VIRTUAL_MODULE = `virtual:medusa/routes`;
var MENU_ITEM_VIRTUAL_MODULE = `virtual:medusa/menu-items`;
var WIDGET_VIRTUAL_MODULE = `virtual:medusa/widgets`;
var VIRTUAL_MODULES = [
  LINK_VIRTUAL_MODULE,
  FORM_VIRTUAL_MODULE,
  DISPLAY_VIRTUAL_MODULE,
  ROUTE_VIRTUAL_MODULE,
  MENU_ITEM_VIRTUAL_MODULE,
  WIDGET_VIRTUAL_MODULE
];
export {
  DISPLAY_VIRTUAL_MODULE,
  FORM_VIRTUAL_MODULE,
  INJECTION_ZONES,
  LINK_VIRTUAL_MODULE,
  MENU_ITEM_VIRTUAL_MODULE,
  NESTED_ROUTE_POSITIONS,
  PRODUCT_CUSTOM_FIELD_CREATE_FORM_TABS,
  PRODUCT_CUSTOM_FIELD_DISPLAY_PATHS,
  PRODUCT_CUSTOM_FIELD_DISPLAY_ZONES,
  PRODUCT_CUSTOM_FIELD_FORM_CONFIG_PATHS,
  PRODUCT_CUSTOM_FIELD_FORM_FIELD_PATHS,
  PRODUCT_CUSTOM_FIELD_FORM_TABS,
  PRODUCT_CUSTOM_FIELD_FORM_ZONES,
  PRODUCT_CUSTOM_FIELD_LINK_PATHS,
  PRODUCT_CUSTOM_FIELD_MODEL,
  ROUTE_VIRTUAL_MODULE,
  VIRTUAL_MODULES,
  WIDGET_VIRTUAL_MODULE,
  isValidCustomFieldDisplayPath,
  isValidCustomFieldDisplayZone,
  isValidCustomFieldFormConfigPath,
  isValidCustomFieldFormFieldPath,
  isValidCustomFieldFormTab,
  isValidCustomFieldFormZone,
  isValidCustomFieldLinkPath,
  isValidCustomFieldModel,
  isValidInjectionZone
};
