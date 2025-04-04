"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderChangeStep = exports.createOrderChangeStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createOrderChangeStepId = "create-order-change";
/**
 * This step creates an order change.
 */
exports.createOrderChangeStep = (0, workflows_sdk_1.createStep)(exports.createOrderChangeStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const created = await service.createOrderChange(data);
    return new workflows_sdk_1.StepResponse(created, created.id);
}, async (id, { container }) => {
    if (!id) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.deleteOrderChanges(id);
});
//# sourceMappingURL=create-order-change.js.map