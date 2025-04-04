"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateShippingOptionsPricesStep = exports.calculateShippingOptionsPricesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.calculateShippingOptionsPricesStepId = "calculate-shipping-options-prices";
/**
 * This step calculates the prices for one or more shipping options.
 *
 * @example
 * const data = calculateShippingOptionsPricesStep([{
 *   id: "so_123",
 *   provider_id: "provider_123",
 *   optionData: {
 *     // custom data relevant for the fulfillment provider
 *     carrier_code: "UPS",
 *   },
 *   data: {
 *     // custom data relevant for the fulfillment provider
 *     // specific to the cart using this shipping option
 *   },
 *   context: {
 *     from_location: {
 *       id: "sloc_123",
 *       // other location fields
 *     }
 *   }
 * }])
 */
exports.calculateShippingOptionsPricesStep = (0, workflows_sdk_1.createStep)(exports.calculateShippingOptionsPricesStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const prices = await service.calculateShippingOptionsPrices(input);
    return new workflows_sdk_1.StepResponse(prices);
});
//# sourceMappingURL=calculate-shipping-options-prices.js.map