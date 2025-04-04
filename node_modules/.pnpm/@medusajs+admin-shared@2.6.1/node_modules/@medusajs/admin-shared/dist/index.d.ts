declare const PRODUCT_CUSTOM_FIELD_MODEL: "product";
declare const PRODUCT_CUSTOM_FIELD_FORM_ZONES: readonly ["create", "edit", "organize", "attributes"];
declare const PRODUCT_CUSTOM_FIELD_CREATE_FORM_TABS: readonly ["general", "organize"];
declare const PRODUCT_CUSTOM_FIELD_FORM_TABS: readonly ["general", "organize"];
declare const PRODUCT_CUSTOM_FIELD_DISPLAY_ZONES: readonly ["general", "organize", "attributes"];
declare const PRODUCT_CUSTOM_FIELD_LINK_PATHS: readonly ["product.$link"];
declare const PRODUCT_CUSTOM_FIELD_FORM_CONFIG_PATHS: readonly string[];
declare const PRODUCT_CUSTOM_FIELD_FORM_FIELD_PATHS: readonly string[];
declare const PRODUCT_CUSTOM_FIELD_DISPLAY_PATHS: readonly string[];

type ProductFormZone = (typeof PRODUCT_CUSTOM_FIELD_FORM_ZONES)[number];
type ProductFormTab = (typeof PRODUCT_CUSTOM_FIELD_FORM_TABS)[number];
type ProductDisplayZone = (typeof PRODUCT_CUSTOM_FIELD_DISPLAY_ZONES)[number];

declare const CUSTOM_FIELD_MODELS: readonly ["product"];
declare const CUSTOM_FIELD_CONTAINER_ZONES: readonly ["general", "organize", "attributes"];
declare const CUSTOM_FIELD_FORM_ZONES: readonly ["create", "edit", "organize", "attributes"];
declare const CUSTOM_FIELD_FORM_TABS: readonly ["general", "organize"];

type CustomFieldModel = (typeof CUSTOM_FIELD_MODELS)[number];
type CustomFieldFormZone = (typeof CUSTOM_FIELD_FORM_ZONES)[number];
type CustomFieldFormTab = (typeof CUSTOM_FIELD_FORM_TABS)[number];
type CustomFieldContainerZone = (typeof CUSTOM_FIELD_CONTAINER_ZONES)[number];
type CustomFieldZone = CustomFieldFormZone | CustomFieldContainerZone;
type CustomFieldImportType = "display" | "field" | "link" | "config";
interface CustomFieldModelFormMap {
    product: ProductFormZone;
}
interface CustomFieldModelContainerMap {
    product: ProductDisplayZone;
}
type CustomFieldModelFormTabsMap = {
    product: {
        create: ProductFormTab;
        edit: never;
        organize: never;
        attributes: never;
    };
    customer: {
        create: never;
        edit: never;
    };
};
type CustomFieldFormKeys<T extends CustomFieldModel> = CustomFieldModelFormMap[T];

declare function isValidCustomFieldModel(id: any): id is CustomFieldModel;
declare function isValidCustomFieldFormZone(id: any): id is CustomFieldFormZone;
declare function isValidCustomFieldFormTab(id: any): id is CustomFieldFormTab;
declare function isValidCustomFieldDisplayZone(id: any): id is CustomFieldContainerZone;
declare function isValidCustomFieldDisplayPath(id: any): id is string;
declare function isValidCustomFieldFormConfigPath(id: any): id is string;
declare function isValidCustomFieldFormFieldPath(id: any): id is string;
declare function isValidCustomFieldLinkPath(id: any): id is string;

declare const NESTED_ROUTE_POSITIONS: readonly ["/orders", "/products", "/inventory", "/customers", "/promotions", "/price-lists"];

type NestedRoutePosition = (typeof NESTED_ROUTE_POSITIONS)[number];

/**
 * All valid injection zones in the admin panel. An injection zone is a specific place
 * in the admin panel where a plugin can inject custom widgets.
 */
declare const INJECTION_ZONES: readonly ["order.details.before", "order.details.after", "order.details.side.before", "order.details.side.after", "order.list.before", "order.list.after", "customer.details.before", "customer.details.after", "customer.list.before", "customer.list.after", "customer_group.details.before", "customer_group.details.after", "customer_group.list.before", "customer_group.list.after", "product.details.before", "product.details.after", "product.list.before", "product.list.after", "product.details.side.before", "product.details.side.after", "product_variant.details.before", "product_variant.details.after", "product_variant.details.side.before", "product_variant.details.side.after", "product_collection.details.before", "product_collection.details.after", "product_collection.list.before", "product_collection.list.after", "product_category.details.before", "product_category.details.after", "product_category.details.side.before", "product_category.details.side.after", "product_category.list.before", "product_category.list.after", "product_type.details.before", "product_type.details.after", "product_type.list.before", "product_type.list.after", "product_tag.details.before", "product_tag.details.after", "product_tag.list.before", "product_tag.list.after", "price_list.details.before", "price_list.details.after", "price_list.details.side.before", "price_list.details.side.after", "price_list.list.before", "price_list.list.after", "promotion.details.before", "promotion.details.after", "promotion.details.side.before", "promotion.details.side.after", "promotion.list.before", "promotion.list.after", "user.details.before", "user.details.after", "user.list.before", "user.list.after", "store.details.before", "store.details.after", "profile.details.before", "profile.details.after", "region.details.before", "region.details.after", "region.list.before", "region.list.after", "shipping_profile.details.before", "shipping_profile.details.after", "shipping_profile.list.before", "shipping_profile.list.after", "location.details.before", "location.details.after", "location.details.side.before", "location.details.side.after", "location.list.before", "location.list.after", "login.before", "login.after", "sales_channel.details.before", "sales_channel.details.after", "sales_channel.list.before", "sales_channel.list.after", "reservation.details.before", "reservation.details.after", "reservation.details.side.before", "reservation.details.side.after", "reservation.list.before", "reservation.list.after", "api_key.details.before", "api_key.details.after", "api_key.list.before", "api_key.list.after", "workflow.details.before", "workflow.details.after", "workflow.list.before", "workflow.list.after", "campaign.details.before", "campaign.details.after", "campaign.details.side.before", "campaign.details.side.after", "campaign.list.before", "campaign.list.after", "tax.details.before", "tax.details.after", "tax.list.before", "tax.list.after", "return_reason.list.before", "return_reason.list.after", "inventory_item.details.before", "inventory_item.details.after", "inventory_item.details.side.before", "inventory_item.details.side.after", "inventory_item.list.before", "inventory_item.list.after"];

type InjectionZone = (typeof INJECTION_ZONES)[number];

/**
 * Validates that the provided zone is a valid injection zone for a widget.
 */
declare function isValidInjectionZone(zone: any): zone is InjectionZone;

declare const LINK_VIRTUAL_MODULE = "virtual:medusa/links";
declare const FORM_VIRTUAL_MODULE = "virtual:medusa/forms";
declare const DISPLAY_VIRTUAL_MODULE = "virtual:medusa/displays";
declare const ROUTE_VIRTUAL_MODULE = "virtual:medusa/routes";
declare const MENU_ITEM_VIRTUAL_MODULE = "virtual:medusa/menu-items";
declare const WIDGET_VIRTUAL_MODULE = "virtual:medusa/widgets";
declare const VIRTUAL_MODULES: readonly ["virtual:medusa/links", "virtual:medusa/forms", "virtual:medusa/displays", "virtual:medusa/routes", "virtual:medusa/menu-items", "virtual:medusa/widgets"];

export { type CustomFieldContainerZone, type CustomFieldFormKeys, type CustomFieldFormTab, type CustomFieldFormZone, type CustomFieldImportType, type CustomFieldModel, type CustomFieldModelContainerMap, type CustomFieldModelFormMap, type CustomFieldModelFormTabsMap, type CustomFieldZone, DISPLAY_VIRTUAL_MODULE, FORM_VIRTUAL_MODULE, INJECTION_ZONES, type InjectionZone, LINK_VIRTUAL_MODULE, MENU_ITEM_VIRTUAL_MODULE, NESTED_ROUTE_POSITIONS, type NestedRoutePosition, PRODUCT_CUSTOM_FIELD_CREATE_FORM_TABS, PRODUCT_CUSTOM_FIELD_DISPLAY_PATHS, PRODUCT_CUSTOM_FIELD_DISPLAY_ZONES, PRODUCT_CUSTOM_FIELD_FORM_CONFIG_PATHS, PRODUCT_CUSTOM_FIELD_FORM_FIELD_PATHS, PRODUCT_CUSTOM_FIELD_FORM_TABS, PRODUCT_CUSTOM_FIELD_FORM_ZONES, PRODUCT_CUSTOM_FIELD_LINK_PATHS, PRODUCT_CUSTOM_FIELD_MODEL, type ProductDisplayZone, type ProductFormTab, type ProductFormZone, ROUTE_VIRTUAL_MODULE, VIRTUAL_MODULES, WIDGET_VIRTUAL_MODULE, isValidCustomFieldDisplayPath, isValidCustomFieldDisplayZone, isValidCustomFieldFormConfigPath, isValidCustomFieldFormFieldPath, isValidCustomFieldFormTab, isValidCustomFieldFormZone, isValidCustomFieldLinkPath, isValidCustomFieldModel, isValidInjectionZone };
