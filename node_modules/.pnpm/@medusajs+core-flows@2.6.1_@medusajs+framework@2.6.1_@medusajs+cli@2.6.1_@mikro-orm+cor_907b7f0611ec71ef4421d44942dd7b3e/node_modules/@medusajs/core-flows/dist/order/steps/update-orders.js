"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrdersStep = exports.updateOrdersStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateOrdersStepId = "update-orders";
/**
 * This step updates orders matching the specified filters.
 *
 * @example
 * const data = updateOrdersStep({
 *   selector: {
 *     id: "order_123"
 *   },
 *   update: {
 *     region_id: "region_123"
 *   }
 * })
 */
exports.updateOrdersStep = (0, workflows_sdk_1.createStep)(exports.updateOrdersStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listOrders(data.selector, {
        select: selects,
        relations,
    });
    const orders = await service.updateOrders(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(orders, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrders(prevData);
});
//# sourceMappingURL=update-orders.js.map