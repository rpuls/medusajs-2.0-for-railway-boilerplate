"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewOrderChangeStep = exports.previewOrderChangeStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.previewOrderChangeStepId = "preview-order-change";
/**
 * This step retrieves a preview of an order change.
 */
exports.previewOrderChangeStep = (0, workflows_sdk_1.createStep)(exports.previewOrderChangeStepId, async (orderId, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const preview = await service.previewOrderChange(orderId);
    return new workflows_sdk_1.StepResponse(preview);
});
//# sourceMappingURL=preview-order-change.js.map