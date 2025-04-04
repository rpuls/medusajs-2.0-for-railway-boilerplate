"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderShippingMethodsStep = exports.updateOrderShippingMethodsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateOrderShippingMethodsStepId = "update-order-shopping-methods";
/**
 * This step updates order shipping methods.
 */
exports.updateOrderShippingMethodsStep = (0, workflows_sdk_1.createStep)(exports.updateOrderShippingMethodsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(data, {
        objectFields: ["metadata"],
    });
    const dataBeforeUpdate = await service.listOrderShippingMethods({ id: data.map((d) => d.id) }, { relations, select: selects });
    const updated = await service.updateOrderShippingMethods(data);
    return new workflows_sdk_1.StepResponse(updated, dataBeforeUpdate);
}, async (dataBeforeUpdate, { container }) => {
    if (!dataBeforeUpdate?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrderShippingMethods(dataBeforeUpdate);
});
//# sourceMappingURL=update-shipping-methods.js.map