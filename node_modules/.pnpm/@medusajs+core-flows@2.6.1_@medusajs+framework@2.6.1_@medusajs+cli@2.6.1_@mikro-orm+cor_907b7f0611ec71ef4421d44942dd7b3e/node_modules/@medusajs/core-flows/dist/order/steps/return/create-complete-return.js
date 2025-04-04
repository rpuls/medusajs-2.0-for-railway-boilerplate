"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompleteReturnStep = exports.createCompleteReturnStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createCompleteReturnStepId = "create-complete-return";
/**
 * This step creates a complete return.
 */
exports.createCompleteReturnStep = (0, workflows_sdk_1.createStep)(exports.createCompleteReturnStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const orderReturn = await service.createReturn(data);
    return new workflows_sdk_1.StepResponse(orderReturn, data.order_id);
}, async (orderId, { container }) => {
    if (!orderId) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.revertLastVersion(orderId);
});
//# sourceMappingURL=create-complete-return.js.map