"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateShippingOptionsPricesWorkflow = exports.calculateShippingOptionsPricesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
const common_1 = require("../../common");
const fields_1 = require("../../cart/utils/fields");
exports.calculateShippingOptionsPricesWorkflowId = "calculate-shipping-options-prices-workflow";
/**
 * This workflow calculates the prices for one or more shipping options in a cart. It's used by the
 * [Calculate Shipping Option Price Store API Route](https://docs.medusajs.com/api/store#shipping-options_postshippingoptionsidcalculate).
 *
 * :::note
 *
 * Calculating shipping option prices may require sending requests to third-party fulfillment services.
 * This depends on the implementation of the fulfillment provider associated with the shipping option.
 *
 * :::
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * calculate the prices of shipping options within your custom flows.
 *
 * @example
 * const { result } = await calculateShippingOptionsPricesWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     shipping_options: [
 *       {
 *         id: "so_123",
 *         data: {
 *           // custom data relevant for the fulfillment provider
 *           carrier_code: "ups",
 *         }
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Calculate shipping option prices in a cart.
 */
exports.calculateShippingOptionsPricesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.calculateShippingOptionsPricesWorkflowId, (input) => {
    const ids = (0, workflows_sdk_1.transform)({ input }, ({ input }) => input.shipping_options.map((so) => so.id));
    const shippingOptionsQuery = (0, common_1.useQueryGraphStep)({
        entity: "shipping_option",
        filters: { id: ids },
        fields: ["id", "provider_id", "data", "service_zone.fulfillment_set_id"],
    }).config({ name: "shipping-options-query" });
    const cartQuery = (0, common_1.useQueryGraphStep)({
        entity: "cart",
        filters: { id: input.cart_id },
        fields: fields_1.cartFieldsForCalculateShippingOptionsPrices,
    }).config({ name: "cart-query" });
    const fulfillmentSetId = (0, workflows_sdk_1.transform)({ shippingOptionsQuery }, ({ shippingOptionsQuery }) => shippingOptionsQuery.data.map((so) => so.service_zone.fulfillment_set_id));
    const locationFulfillmentSetQuery = (0, common_1.useQueryGraphStep)({
        entity: "location_fulfillment_set",
        filters: { fulfillment_set_id: fulfillmentSetId },
        fields: ["id", "stock_location_id", "fulfillment_set_id"],
    }).config({ name: "location-fulfillment-set-query" });
    const locationIds = (0, workflows_sdk_1.transform)({ locationFulfillmentSetQuery }, ({ locationFulfillmentSetQuery }) => locationFulfillmentSetQuery.data.map((lfs) => lfs.stock_location_id));
    const locationQuery = (0, common_1.useQueryGraphStep)({
        entity: "stock_location",
        filters: { id: locationIds },
        fields: ["id", "name", "address.*"],
    }).config({ name: "location-query" });
    const data = (0, workflows_sdk_1.transform)({
        shippingOptionsQuery,
        cartQuery,
        input,
        locationFulfillmentSetQuery,
        locationQuery,
    }, ({ shippingOptionsQuery, cartQuery, input, locationFulfillmentSetQuery, locationQuery, }) => {
        const shippingOptions = shippingOptionsQuery.data;
        const cart = cartQuery.data[0];
        const locations = locationQuery.data;
        const locationFulfillmentSetMap = new Map(locationFulfillmentSetQuery.data.map((lfs) => [
            lfs.fulfillment_set_id,
            lfs.stock_location_id,
        ]));
        const shippingOptionDataMap = new Map(input.shipping_options.map((so) => [so.id, so.data]));
        return shippingOptions.map((shippingOption) => ({
            id: shippingOption.id,
            provider_id: shippingOption.provider_id,
            optionData: shippingOption.data,
            data: shippingOptionDataMap.get(shippingOption.id) ?? {},
            context: {
                ...cart,
                from_location: locations.find((l) => l.id ===
                    locationFulfillmentSetMap.get(shippingOption.service_zone.fulfillment_set_id)),
            },
        }));
    });
    const prices = (0, steps_1.calculateShippingOptionsPricesStep)(data);
    return new workflows_sdk_1.WorkflowResponse(prices);
});
//# sourceMappingURL=calculate-shipping-options-prices.js.map