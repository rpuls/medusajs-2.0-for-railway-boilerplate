"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleRegistrationName = exports.REVERSED_MODULE_PACKAGE_NAMES = exports.MODULE_PACKAGE_NAMES = exports.Modules = void 0;
exports.Modules = {
    AUTH: "auth",
    CACHE: "cache",
    CART: "cart",
    CUSTOMER: "customer",
    EVENT_BUS: "event_bus",
    INVENTORY: "inventory",
    LINK: "link_modules",
    PAYMENT: "payment",
    PRICING: "pricing",
    PRODUCT: "product",
    PROMOTION: "promotion",
    SALES_CHANNEL: "sales_channel",
    TAX: "tax",
    FULFILLMENT: "fulfillment",
    STOCK_LOCATION: "stock_location",
    USER: "user",
    WORKFLOW_ENGINE: "workflows",
    REGION: "region",
    ORDER: "order",
    API_KEY: "api_key",
    STORE: "store",
    CURRENCY: "currency",
    FILE: "file",
    NOTIFICATION: "notification",
    INDEX: "index",
    LOCKING: "locking",
};
exports.MODULE_PACKAGE_NAMES = {
    [exports.Modules.AUTH]: "@medusajs/medusa/auth",
    [exports.Modules.CACHE]: "@medusajs/medusa/cache-inmemory",
    [exports.Modules.CART]: "@medusajs/medusa/cart",
    [exports.Modules.CUSTOMER]: "@medusajs/medusa/customer",
    [exports.Modules.EVENT_BUS]: "@medusajs/medusa/event-bus-local",
    [exports.Modules.INVENTORY]: "@medusajs/medusa/inventory",
    [exports.Modules.LINK]: "@medusajs/medusa/link-modules",
    [exports.Modules.PAYMENT]: "@medusajs/medusa/payment",
    [exports.Modules.PRICING]: "@medusajs/medusa/pricing",
    [exports.Modules.PRODUCT]: "@medusajs/medusa/product",
    [exports.Modules.PROMOTION]: "@medusajs/medusa/promotion",
    [exports.Modules.SALES_CHANNEL]: "@medusajs/medusa/sales-channel",
    [exports.Modules.FULFILLMENT]: "@medusajs/medusa/fulfillment",
    [exports.Modules.STOCK_LOCATION]: "@medusajs/medusa/stock-location",
    [exports.Modules.TAX]: "@medusajs/medusa/tax",
    [exports.Modules.USER]: "@medusajs/medusa/user",
    [exports.Modules.WORKFLOW_ENGINE]: "@medusajs/medusa/workflow-engine-inmemory",
    [exports.Modules.REGION]: "@medusajs/medusa/region",
    [exports.Modules.ORDER]: "@medusajs/medusa/order",
    [exports.Modules.API_KEY]: "@medusajs/medusa/api-key",
    [exports.Modules.STORE]: "@medusajs/medusa/store",
    [exports.Modules.CURRENCY]: "@medusajs/medusa/currency",
    [exports.Modules.FILE]: "@medusajs/medusa/file",
    [exports.Modules.NOTIFICATION]: "@medusajs/medusa/notification",
    [exports.Modules.INDEX]: "@medusajs/medusa/index-module",
    [exports.Modules.LOCKING]: "@medusajs/medusa/locking",
};
exports.REVERSED_MODULE_PACKAGE_NAMES = Object.entries(exports.MODULE_PACKAGE_NAMES).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
}, {});
// TODO: temporary fix until the event bus, cache and workflow engine are migrated to use providers and therefore only a single resolution will be good
exports.REVERSED_MODULE_PACKAGE_NAMES["@medusajs/medusa/event-bus-redis"] =
    exports.Modules.EVENT_BUS;
exports.REVERSED_MODULE_PACKAGE_NAMES["@medusajs/medusa/cache-redis"] = exports.Modules.CACHE;
exports.REVERSED_MODULE_PACKAGE_NAMES["@medusajs/medusa/workflow-engine-redis"] =
    exports.Modules.WORKFLOW_ENGINE;
exports.ModuleRegistrationName = exports.Modules;
//# sourceMappingURL=definition.js.map