"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReturnReasonsStep = exports.createReturnReasonsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createReturnReasonsStepId = "create-return-reasons";
/**
 * This step creates one or more return reasons.
 *
 * @example
 * const data = createReturnReasonsStep([
 *   {
 *     label: "Damaged",
 *     value: "damaged",
 *   }
 * ])
 */
exports.createReturnReasonsStep = (0, workflows_sdk_1.createStep)(exports.createReturnReasonsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const createdReturnReasons = await service.createReturnReasons(data);
    return new workflows_sdk_1.StepResponse(createdReturnReasons, createdReturnReasons.map((createdReturnReasons) => createdReturnReasons.id));
}, async (createdReturnReasonIds, { container }) => {
    if (!createdReturnReasonIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.deleteReturnReasons(createdReturnReasonIds);
});
//# sourceMappingURL=create-return-reasons.js.map