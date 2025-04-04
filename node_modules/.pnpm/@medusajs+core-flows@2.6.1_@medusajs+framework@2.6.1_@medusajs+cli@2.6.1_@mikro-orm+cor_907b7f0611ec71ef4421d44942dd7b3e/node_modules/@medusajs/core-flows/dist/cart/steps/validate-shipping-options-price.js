"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCartShippingOptionsPriceStep = exports.validateCartShippingOptionsPriceStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.validateCartShippingOptionsPriceStepId = "validate-cart-shipping-options";
/**
 * This step validates shipping options to ensure they have a price.
 * If not valid, the step throws an error.
 *
 * @example
 * const data = validateCartShippingOptionsPriceStep({
 *   shippingOptions: [
 *     {
 *       id: "so_123",
 *     },
 *     {
 *       id: "so_321",
 *       calculated_price: {
 *         calculated_amount: 10,
 *       }
 *     }
 *   ]
 * })
 */
exports.validateCartShippingOptionsPriceStep = (0, workflows_sdk_1.createStep)("validate-cart-shipping-options-price", async (data, { container }) => {
    const { shippingOptions = [] } = data;
    const optionsMissingPrices = [];
    for (const shippingOption of shippingOptions) {
        const { calculated_price, ...options } = shippingOption;
        if (shippingOption?.id &&
            !(0, utils_1.isDefined)(calculated_price?.calculated_amount)) {
            optionsMissingPrices.push(options.id);
        }
    }
    if (optionsMissingPrices.length) {
        const ids = optionsMissingPrices.join(", ");
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Shipping options with IDs ${ids} do not have a price`);
    }
    return new workflows_sdk_1.StepResponse(void 0);
});
//# sourceMappingURL=validate-shipping-options-price.js.map