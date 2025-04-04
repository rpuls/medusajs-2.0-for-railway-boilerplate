"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartsStep = exports.updateCartsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateCartsStepId = "update-carts";
/**
 * This step updates a cart.
 *
 * @example
 * const data = updateCartsStep([{
 *   id: "cart_123",
 *   email: "customer@gmail.com",
 * }])
 */
exports.updateCartsStep = (0, workflows_sdk_1.createStep)(exports.updateCartsStepId, async (data, { container }) => {
    const cartModule = container.resolve(utils_1.Modules.CART);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(data);
    const cartsBeforeUpdate = await cartModule.listCarts({ id: data.map((d) => d.id) }, { select: selects, relations });
    const updatedCart = await cartModule.updateCarts(data);
    return new workflows_sdk_1.StepResponse(updatedCart, cartsBeforeUpdate);
}, async (cartsBeforeUpdate, { container }) => {
    if (!cartsBeforeUpdate) {
        return;
    }
    const cartModule = container.resolve(utils_1.Modules.CART);
    const dataToUpdate = [];
    for (const cart of cartsBeforeUpdate) {
        dataToUpdate.push({
            id: cart.id,
            region_id: cart.region_id,
            customer_id: cart.customer_id,
            sales_channel_id: cart.sales_channel_id,
            email: cart.email,
            currency_code: cart.currency_code,
            metadata: cart.metadata,
            completed_at: cart.completed_at,
        });
    }
    return await cartModule.updateCarts(dataToUpdate);
});
//# sourceMappingURL=update-carts.js.map