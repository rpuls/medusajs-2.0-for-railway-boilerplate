"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addShippingMethodToCartStep = exports.addShippingMethodToCartStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.addShippingMethodToCartStepId = "add-shipping-method-to-cart-step";
/**
 * This step adds shipping methods to a cart.
 *
 * @example
 * const data = addShippingMethodToCartStep({
 *   shipping_methods: [
 *     {
 *       name: "Standard Shipping",
 *       cart_id: "cart_123",
 *       amount: 10,
 *     }
 *   ]
 * })
 */
exports.addShippingMethodToCartStep = (0, workflows_sdk_1.createStep)(exports.addShippingMethodToCartStepId, async (data, { container }) => {
    if (!data.shipping_methods?.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const cartService = container.resolve(utils_1.Modules.CART);
    const methods = await cartService.addShippingMethods(data.shipping_methods);
    return new workflows_sdk_1.StepResponse(methods, methods);
}, async (methods, { container }) => {
    const cartService = container.resolve(utils_1.Modules.CART);
    if (!methods?.length) {
        return;
    }
    await cartService.deleteShippingMethods(methods.map((m) => m.id));
});
//# sourceMappingURL=add-shipping-method-to-cart.js.map