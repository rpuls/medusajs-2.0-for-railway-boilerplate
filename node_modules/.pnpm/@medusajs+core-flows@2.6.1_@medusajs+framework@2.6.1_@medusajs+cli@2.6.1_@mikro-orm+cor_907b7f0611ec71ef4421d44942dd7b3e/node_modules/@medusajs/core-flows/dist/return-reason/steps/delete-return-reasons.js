"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReturnReasonStep = exports.deleteReturnReasonStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteReturnReasonStepId = "delete-return-reasons";
/**
 * This step deletes one or more return reasons.
 *
 * @example
 * const data = deleteReturnReasonStep(["rr_123"])
 */
exports.deleteReturnReasonStep = (0, workflows_sdk_1.createStep)(exports.deleteReturnReasonStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.softDeleteReturnReasons(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevReturnReasons, { container }) => {
    if (!prevReturnReasons) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.restoreReturnReasons(prevReturnReasons);
});
//# sourceMappingURL=delete-return-reasons.js.map