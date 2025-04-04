"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRefundReasonsStep = exports.updateRefundReasonStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateRefundReasonStepId = "update-refund-reasons";
/**
 * This step updates one or more refund reasons.
 */
exports.updateRefundReasonsStep = (0, workflows_sdk_1.createStep)(exports.updateRefundReasonStepId, async (data, { container }) => {
    const ids = data.map((d) => d.id);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(data);
    const service = container.resolve(utils_1.Modules.PAYMENT);
    const prevRefundReasons = await service.listRefundReasons({ id: ids }, { select: selects, relations });
    const reasons = await service.updateRefundReasons(data);
    return new workflows_sdk_1.StepResponse(reasons, prevRefundReasons);
}, async (previousData, { container }) => {
    if (!previousData) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PAYMENT);
    await (0, utils_1.promiseAll)(previousData.map((refundReason) => service.updateRefundReasons(refundReason)));
});
//# sourceMappingURL=update-refund-reasons.js.map