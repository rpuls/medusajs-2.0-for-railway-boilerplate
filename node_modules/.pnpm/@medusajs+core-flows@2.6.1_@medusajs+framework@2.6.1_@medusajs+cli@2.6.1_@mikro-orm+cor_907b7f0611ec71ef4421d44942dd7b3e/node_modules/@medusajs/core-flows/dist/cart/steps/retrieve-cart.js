"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveCartStep = exports.retrieveCartStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.retrieveCartStepId = "retrieve-cart";
/**
 * This step retrieves a cart's details.
 */
exports.retrieveCartStep = (0, workflows_sdk_1.createStep)(exports.retrieveCartStepId, async (data, { container }) => {
    const cartModuleService = container.resolve(utils_1.Modules.CART);
    const cart = await cartModuleService.retrieveCart(data.id, data.config);
    // TODO: remove this when cart handles totals calculation
    cart.items = cart.items?.map((item) => {
        item.subtotal = item.unit_price;
        return item;
    });
    // TODO: remove this when cart handles totals calculation
    cart.shipping_methods = cart.shipping_methods?.map((shipping_method) => {
        // TODO: should we align all amounts/prices fields to be unit_price?
        shipping_method.subtotal = shipping_method.amount;
        return shipping_method;
    });
    return new workflows_sdk_1.StepResponse(cart);
});
//# sourceMappingURL=retrieve-cart.js.map