"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShippingMethodsStep = exports.updateShippingMethodsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateShippingMethodsStepId = "update-shipping-methods-step";
/**
 * This step updates a cart's shipping methods.
 *
 * @example
 * const data = updateOrderShippingMethodsStep([
 *   {
 *     id: "sm_123",
 *     amount: 10
 *   }
 * ])
 */
exports.updateShippingMethodsStep = (0, workflows_sdk_1.createStep)(exports.updateShippingMethodsStepId, async (data, { container }) => {
    if (!data?.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const cartModule = container.resolve(utils_1.Modules.CART);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(data);
    const dataBeforeUpdate = await cartModule.listShippingMethods({ id: data.map((d) => d.id) }, { select: selects, relations });
    const updatedItems = await cartModule.updateShippingMethods(data);
    return new workflows_sdk_1.StepResponse(updatedItems, dataBeforeUpdate);
}, async (dataBeforeUpdate, { container }) => {
    if (!dataBeforeUpdate?.length) {
        return;
    }
    const cartModule = container.resolve(utils_1.Modules.CART);
    await cartModule.updateShippingMethods(dataBeforeUpdate);
});
//# sourceMappingURL=update-shipping-methods.js.map