"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listShippingOptionsForCartWithPricingWorkflow = exports.listShippingOptionsForCartWithPricingWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const use_remote_query_1 = require("../../common/steps/use-remote-query");
const fulfillment_1 = require("../../fulfillment");
const fields_1 = require("../utils/fields");
const COMMON_OPTIONS_FIELDS = [
    "id",
    "name",
    "price_type",
    "service_zone_id",
    "service_zone.fulfillment_set_id",
    "service_zone.fulfillment_set.type",
    "service_zone.fulfillment_set.location.address.*",
    "shipping_profile_id",
    "provider_id",
    "data",
    "type.id",
    "type.label",
    "type.description",
    "type.code",
    "provider.id",
    "provider.is_enabled",
    "rules.attribute",
    "rules.value",
    "rules.operator",
];
exports.listShippingOptionsForCartWithPricingWorkflowId = "list-shipping-options-for-cart-with-pricing";
/**
 * This workflow lists shipping options that can be used during checkout for a cart. It also retrieves the prices
 * of these shipping options, including calculated prices that may be retrieved from third-party providers.
 *
 * This workflow is executed in other cart-related workflows, such as {@link addShippingMethodToCartWorkflow} to retrieve the
 * price of the shipping method being added to the cart.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to retrieve the shipping options of a cart and their prices
 * in your custom flows.
 *
 * @example
 * const { result } = await listShippingOptionsForCartWithPricingWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     options: [
 *       {
 *         id: "so_123",
 *         data: {
 *           carrier_code: "fedex"
 *         }
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * List a cart's shipping options with prices.
 */
exports.listShippingOptionsForCartWithPricingWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.listShippingOptionsForCartWithPricingWorkflowId, (input) => {
    const optionIds = (0, workflows_sdk_1.transform)({ input }, ({ input }) => (input.options ?? []).map(({ id }) => id));
    const cartQuery = (0, common_1.useQueryGraphStep)({
        entity: "cart",
        filters: { id: input.cart_id },
        fields: [
            ...fields_1.cartFieldsForCalculateShippingOptionsPrices,
            "sales_channel_id",
            "currency_code",
            "region_id",
            "item_total",
            "total",
        ],
        options: { throwIfKeyNotFound: true },
    }).config({ name: "get-cart" });
    const cart = (0, workflows_sdk_1.transform)({ cartQuery }, ({ cartQuery }) => cartQuery.data[0]);
    (0, common_1.validatePresenceOfStep)({
        entity: cart,
        fields: ["sales_channel_id", "region_id", "currency_code"],
    });
    const scFulfillmentSetQuery = (0, common_1.useQueryGraphStep)({
        entity: "sales_channels",
        filters: { id: cart.sales_channel_id },
        fields: [
            "stock_locations.id",
            "stock_locations.name",
            "stock_locations.address.*",
            "stock_locations.fulfillment_sets.id",
        ],
    }).config({ name: "sales_channels-fulfillment-query" });
    const scFulfillmentSets = (0, workflows_sdk_1.transform)({ scFulfillmentSetQuery }, ({ scFulfillmentSetQuery }) => scFulfillmentSetQuery.data[0]);
    const { fulfillmentSetIds, fulfillmentSetLocationMap } = (0, workflows_sdk_1.transform)({ scFulfillmentSets }, ({ scFulfillmentSets }) => {
        const fulfillmentSetIds = new Set();
        const fulfillmentSetLocationMap = {};
        scFulfillmentSets.stock_locations.forEach((stockLocation) => {
            stockLocation.fulfillment_sets.forEach((fulfillmentSet) => {
                fulfillmentSetLocationMap[fulfillmentSet.id] = stockLocation;
                fulfillmentSetIds.add(fulfillmentSet.id);
            });
        });
        return {
            fulfillmentSetIds: Array.from(fulfillmentSetIds),
            fulfillmentSetLocationMap,
        };
    });
    const commonOptions = (0, workflows_sdk_1.transform)({ input, cart, fulfillmentSetIds }, ({ input, cart, fulfillmentSetIds }) => ({
        context: {
            is_return: input.is_return ? "true" : "false",
            enabled_in_store: !(0, utils_1.isDefined)(input.enabled_in_store)
                ? "true"
                : input.enabled_in_store
                    ? "true"
                    : "false",
        },
        filters: {
            fulfillment_set_id: fulfillmentSetIds,
            address: {
                country_code: cart.shipping_address?.country_code,
                province_code: cart.shipping_address?.province,
                city: cart.shipping_address?.city,
                postal_expression: cart.shipping_address?.postal_code,
            },
        },
    }));
    const typeQueryFilters = (0, workflows_sdk_1.transform)({ optionIds, commonOptions }, ({ optionIds, commonOptions }) => ({
        id: optionIds.length ? optionIds : undefined,
        ...commonOptions,
    }));
    /**
     * We need to prefetch exact same SO as in the final result but only to determine pricing calculations first.
     */
    const initialOptions = (0, use_remote_query_1.useRemoteQueryStep)({
        entry_point: "shipping_options",
        variables: typeQueryFilters,
        fields: ["id", "price_type"],
    }).config({ name: "shipping-options-price-type-query" });
    /**
     * Prepare queries for flat rate and calculated shipping options since price calculations are different for each.
     */
    const { flatRateOptionsQuery, calculatedShippingOptionsQuery } = (0, workflows_sdk_1.transform)({
        cart,
        initialOptions,
        commonOptions,
    }, ({ cart, initialOptions, commonOptions }) => {
        const flatRateShippingOptionIds = [];
        const calculatedShippingOptionIds = [];
        initialOptions.forEach((option) => {
            if (option.price_type === utils_1.ShippingOptionPriceType.FLAT) {
                flatRateShippingOptionIds.push(option.id);
            }
            else {
                calculatedShippingOptionIds.push(option.id);
            }
        });
        return {
            flatRateOptionsQuery: {
                ...commonOptions,
                id: flatRateShippingOptionIds,
                calculated_price: { context: cart },
            },
            calculatedShippingOptionsQuery: {
                ...commonOptions,
                id: calculatedShippingOptionIds,
            },
        };
    });
    const [shippingOptionsFlatRate, shippingOptionsCalculated] = (0, workflows_sdk_1.parallelize)((0, use_remote_query_1.useRemoteQueryStep)({
        entry_point: "shipping_options",
        fields: [
            ...COMMON_OPTIONS_FIELDS,
            "calculated_price.*",
            "prices.*",
            "prices.price_rules.*",
        ],
        variables: flatRateOptionsQuery,
    }).config({ name: "shipping-options-query-flat-rate" }), (0, use_remote_query_1.useRemoteQueryStep)({
        entry_point: "shipping_options",
        fields: [...COMMON_OPTIONS_FIELDS],
        variables: calculatedShippingOptionsQuery,
    }).config({ name: "shipping-options-query-calculated" }));
    const calculateShippingOptionsPricesData = (0, workflows_sdk_1.transform)({
        shippingOptionsCalculated,
        cart,
        input,
        fulfillmentSetLocationMap,
    }, ({ shippingOptionsCalculated, cart, input, fulfillmentSetLocationMap, }) => {
        const optionDataMap = new Map((input.options ?? []).map(({ id, data }) => [id, data]));
        return shippingOptionsCalculated.map((so) => ({
            id: so.id,
            optionData: so.data,
            context: {
                ...cart,
                from_location: fulfillmentSetLocationMap[so.service_zone.fulfillment_set_id],
            },
            data: optionDataMap.get(so.id),
            provider_id: so.provider_id,
        }));
    });
    const prices = (0, fulfillment_1.calculateShippingOptionsPricesStep)(calculateShippingOptionsPricesData);
    const shippingOptionsWithPrice = (0, workflows_sdk_1.transform)({
        shippingOptionsFlatRate,
        shippingOptionsCalculated,
        prices,
        fulfillmentSetLocationMap,
    }, ({ shippingOptionsFlatRate, shippingOptionsCalculated, prices, fulfillmentSetLocationMap, }) => {
        return [
            ...shippingOptionsFlatRate.map((shippingOption) => {
                const price = shippingOption.calculated_price;
                return {
                    ...shippingOption,
                    amount: price?.calculated_amount,
                    is_tax_inclusive: !!price?.is_calculated_price_tax_inclusive,
                };
            }),
            ...shippingOptionsCalculated.map((shippingOption, index) => {
                return {
                    ...shippingOption,
                    amount: prices[index]?.calculated_amount,
                    is_tax_inclusive: prices[index]?.is_calculated_price_tax_inclusive,
                    calculated_price: prices[index],
                    stock_location: fulfillmentSetLocationMap[shippingOption.service_zone.fulfillment_set_id],
                };
            }),
        ];
    });
    return new workflows_sdk_1.WorkflowResponse(shippingOptionsWithPrice);
});
//# sourceMappingURL=list-shipping-options-for-cart-with-pricing.js.map