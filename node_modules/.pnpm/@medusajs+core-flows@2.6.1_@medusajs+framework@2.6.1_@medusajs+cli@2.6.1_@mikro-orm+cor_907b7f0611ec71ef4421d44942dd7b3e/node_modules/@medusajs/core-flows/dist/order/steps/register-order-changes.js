"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderChangesStep = exports.registerOrderChangeStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.registerOrderChangeStepId = "register-order-change";
/**
 * This step registers an order changes.
 */
exports.registerOrderChangesStep = (0, workflows_sdk_1.createStep)(exports.registerOrderChangeStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.ModuleRegistrationName.ORDER);
    const orderChanges = await service.registerOrderChange(data);
    return new workflows_sdk_1.StepResponse(void 0, orderChanges.map((c) => c.id));
}, async (orderChangeIds, { container }) => {
    if (!orderChangeIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.ModuleRegistrationName.ORDER);
    await service.deleteOrderChanges(orderChangeIds);
});
//# sourceMappingURL=register-order-changes.js.map