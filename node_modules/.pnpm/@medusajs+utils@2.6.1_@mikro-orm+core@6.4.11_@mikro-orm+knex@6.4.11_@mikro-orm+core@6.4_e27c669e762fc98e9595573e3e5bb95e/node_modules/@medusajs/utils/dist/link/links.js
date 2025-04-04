"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LINKS = void 0;
const definition_1 = require("../modules-sdk/definition");
const compose_link_name_1 = require("./compose-link-name");
exports.LINKS = {
    ProductVariantInventoryItem: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.PRODUCT, "variant_id", definition_1.Modules.INVENTORY, "inventory_item_id"),
    ProductVariantPriceSet: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.PRODUCT, "variant_id", definition_1.Modules.PRICING, "price_set_id"),
    ShippingOptionPriceSet: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.FULFILLMENT, "shipping_option_id", definition_1.Modules.PRICING, "price_set_id"),
    CartPaymentCollection: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.CART, "cart_id", definition_1.Modules.PAYMENT, "payment_collection_id"),
    RegionPaymentProvider: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.REGION, "region_id", definition_1.Modules.PAYMENT, "payment_provider_id"),
    CartPromotion: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.CART, "cart_id", definition_1.Modules.PROMOTION, "promotion_id"),
    SalesChannelLocation: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.SALES_CHANNEL, "sales_channel_id", definition_1.Modules.STOCK_LOCATION, "location_id"),
    LocationFulfillmentProvider: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.STOCK_LOCATION, "stock_location_id", definition_1.Modules.FULFILLMENT, "fulfillment_provider_id"),
    LocationFulfillmentSet: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.STOCK_LOCATION, "stock_location_id", definition_1.Modules.FULFILLMENT, "fulfillment_set_id"),
    OrderPromotion: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.ORDER, "order_id", definition_1.Modules.PROMOTION, "promotion_id"),
    OrderCart: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.ORDER, "order_id", definition_1.Modules.CART, "cart_id"),
    OrderSalesChannel: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.ORDER, "order_id", definition_1.Modules.SALES_CHANNEL, "sales_channel_id"),
    PublishableApiKeySalesChannel: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.API_KEY, "api_key_id", definition_1.Modules.SALES_CHANNEL, "sales_channel_id"),
    ProductSalesChannel: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.PRODUCT, "product_id", definition_1.Modules.SALES_CHANNEL, "sales_channel_id"),
    OrderPaymentCollection: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.ORDER, "order_id", definition_1.Modules.PAYMENT, "payment_collection_id"),
    OrderClaimPaymentCollection: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.ORDER, "claim_id", definition_1.Modules.PAYMENT, "payment_collection_id"),
    OrderExchangePaymentCollection: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.ORDER, "exchange_id", definition_1.Modules.PAYMENT, "payment_collection_id"),
    OrderFulfillment: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.ORDER, "order_id", definition_1.Modules.FULFILLMENT, "fulfillment_id"),
    ReturnFulfillment: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.ORDER, "return_id", definition_1.Modules.FULFILLMENT, "fulfillment_id"),
    ProductShippingProfile: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.PRODUCT, "product_id", definition_1.Modules.FULFILLMENT, "shipping_profile_id"),
    CustomerAccountHolder: (0, compose_link_name_1.composeLinkName)(definition_1.Modules.CUSTOMER, "customer_id", definition_1.Modules.PAYMENT, "account_holder_id"),
};
//# sourceMappingURL=links.js.map