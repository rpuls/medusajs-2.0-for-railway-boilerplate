"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveReturnStep = exports.receiveReturnStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.receiveReturnStepId = "receive-return";
/**
 * This step marks a return as received.
 */
exports.receiveReturnStep = (0, workflows_sdk_1.createStep)(exports.receiveReturnStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    if (!data.items?.length) {
        return new workflows_sdk_1.StepResponse(void 0);
    }
    const received = await service.receiveReturn(data);
    return new workflows_sdk_1.StepResponse(received, data.return_id);
}, async (orderId, { container }) => {
    if (!orderId) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.revertLastVersion(orderId);
});
//# sourceMappingURL=receive-return.js.map