"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.archiveOrdersStep = exports.archiveOrdersStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.archiveOrdersStepId = "archive-orders";
/**
 * This step archives one or more orders.
 */
exports.archiveOrdersStep = (0, workflows_sdk_1.createStep)(exports.archiveOrdersStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const archived = await service.archive(data.orderIds);
    return new workflows_sdk_1.StepResponse(archived, archived.map((store) => {
        return {
            id: store.id,
            status: store.status,
        };
    }));
}, async (archived, { container }) => {
    if (!archived?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrders(archived);
});
//# sourceMappingURL=archive-orders.js.map