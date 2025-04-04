"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrdersStep = exports.cancelOrdersStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.cancelOrdersStepId = "cancel-orders";
/**
 * This step cancels one or more orders.
 */
exports.cancelOrdersStep = (0, workflows_sdk_1.createStep)(exports.cancelOrdersStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const orders = await service.listOrders({
        id: data.orderIds,
    }, {
        select: ["id", "status"],
    });
    const canceled = await service.cancel(data.orderIds);
    return new workflows_sdk_1.StepResponse(canceled, canceled.map((order) => {
        const prevData = orders.find((o) => o.id === order.id);
        return {
            id: order.id,
            status: prevData.status,
            canceled_at: null,
            canceled_by: null,
        };
    }));
}, async (canceled, { container }) => {
    if (!canceled?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrders(canceled);
});
//# sourceMappingURL=cancel-orders.js.map