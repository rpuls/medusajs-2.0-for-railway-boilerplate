"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefundReasonStep = exports.createRefundReasonStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createRefundReasonStepId = "create-refund-reason";
/**
 * This step creates one or more refund reasons.
 */
exports.createRefundReasonStep = (0, workflows_sdk_1.createStep)(exports.createRefundReasonStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PAYMENT);
    const refundReasons = await service.createRefundReasons(data);
    return new workflows_sdk_1.StepResponse(refundReasons, refundReasons.map((rr) => rr.id));
}, async (ids, { container }) => {
    if (!ids?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PAYMENT);
    await service.deleteRefundReasons(ids);
});
//# sourceMappingURL=create-refund-reasons.js.map