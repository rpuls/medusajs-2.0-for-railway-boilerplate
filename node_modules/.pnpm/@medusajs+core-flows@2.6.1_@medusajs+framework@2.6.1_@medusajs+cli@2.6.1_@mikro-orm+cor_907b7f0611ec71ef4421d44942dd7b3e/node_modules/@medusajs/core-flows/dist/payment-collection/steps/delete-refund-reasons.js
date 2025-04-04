"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRefundReasonsStep = exports.deleteRefundReasonsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteRefundReasonsStepId = "delete-refund-reasons";
/**
 * This step deletes one or more refund reasons.
 */
exports.deleteRefundReasonsStep = (0, workflows_sdk_1.createStep)(exports.deleteRefundReasonsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.PAYMENT);
    await service.softDeleteRefundReasons(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevCustomerIds, { container }) => {
    if (!prevCustomerIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PAYMENT);
    await service.restoreRefundReasons(prevCustomerIds);
});
//# sourceMappingURL=delete-refund-reasons.js.map