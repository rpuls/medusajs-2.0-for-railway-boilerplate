"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeShippingMethodFromCartStep = exports.removeShippingMethodFromCartStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.removeShippingMethodFromCartStepId = "remove-shipping-method-to-cart-step";
/**
 * This step removes shipping methods from a cart.
 */
exports.removeShippingMethodFromCartStep = (0, workflows_sdk_1.createStep)(exports.removeShippingMethodFromCartStepId, async (data, { container }) => {
    const cartService = container.resolve(utils_1.Modules.CART);
    if (!data?.shipping_method_ids?.length) {
        return new workflows_sdk_1.StepResponse(null, []);
    }
    const methods = await cartService.softDeleteShippingMethods(data.shipping_method_ids);
    return new workflows_sdk_1.StepResponse(methods, data.shipping_method_ids);
}, async (ids, { container }) => {
    if (!ids?.length) {
        return;
    }
    const cartService = container.resolve(utils_1.Modules.CART);
    await cartService.restoreShippingMethods(ids);
});
//# sourceMappingURL=remove-shipping-method-from-cart.js.map