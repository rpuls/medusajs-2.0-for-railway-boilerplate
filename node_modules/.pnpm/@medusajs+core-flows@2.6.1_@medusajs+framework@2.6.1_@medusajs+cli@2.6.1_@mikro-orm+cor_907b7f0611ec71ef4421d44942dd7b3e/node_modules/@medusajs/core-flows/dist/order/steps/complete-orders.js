"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeOrdersStep = exports.completeOrdersStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.completeOrdersStepId = "complete-orders";
/**
 * This step completes one or more orders.
 */
exports.completeOrdersStep = (0, workflows_sdk_1.createStep)(exports.completeOrdersStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const orders = await service.listOrders({
        id: data.orderIds,
    }, {
        select: ["id", "status"],
    });
    const completed = await service.completeOrder(data.orderIds);
    return new workflows_sdk_1.StepResponse(completed, completed.map((order) => {
        const prevData = orders.find((o) => o.id === order.id);
        return {
            id: order.id,
            status: prevData.status,
        };
    }));
}, async (completed, { container }) => {
    if (!completed?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrders(completed);
});
//# sourceMappingURL=complete-orders.js.map