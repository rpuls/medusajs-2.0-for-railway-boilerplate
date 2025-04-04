"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCartShippingOptionsStep = exports.validateCartShippingOptionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.validateCartShippingOptionsStepId = "validate-cart-shipping-options";
/**
 * This step validates shipping options to ensure they can be applied on a cart.
 * If not valid, the step throws an error.
 *
 * @example
 * const data = validateCartShippingOptionsStep({
 *   // retrieve the details of the cart from another workflow
 *   // or in another step using the Cart Module's service
 *   cart,
 *   option_ids: ["so_123"],
 *   shippingOptionsContext: {}
 * })
 */
exports.validateCartShippingOptionsStep = (0, workflows_sdk_1.createStep)(exports.validateCartShippingOptionsStepId, async (data, { container }) => {
    const { option_ids: optionIds = [], cart, shippingOptionsContext } = data;
    if (!optionIds.length) {
        return new workflows_sdk_1.StepResponse(void 0);
    }
    const fulfillmentModule = container.resolve(utils_1.Modules.FULFILLMENT);
    const validShippingOptions = await fulfillmentModule.listShippingOptionsForContext({
        id: optionIds,
        context: shippingOptionsContext,
        address: {
            country_code: cart.shipping_address?.country_code,
            province_code: cart.shipping_address?.province,
            city: cart.shipping_address?.city,
            postal_expression: cart.shipping_address?.postal_code,
        },
    }, { relations: ["rules"] });
    const validShippingOptionIds = validShippingOptions.map((o) => o.id);
    const invalidOptionIds = (0, utils_1.arrayDifference)(optionIds, validShippingOptionIds);
    if (invalidOptionIds.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Shipping Options are invalid for cart.`);
    }
    return new workflows_sdk_1.StepResponse(void 0);
});
//# sourceMappingURL=validate-cart-shipping-options.js.map