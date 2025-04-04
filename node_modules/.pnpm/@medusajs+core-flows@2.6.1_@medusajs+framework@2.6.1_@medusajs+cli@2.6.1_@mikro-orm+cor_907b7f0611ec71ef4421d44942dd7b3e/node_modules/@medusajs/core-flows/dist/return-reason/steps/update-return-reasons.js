"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReturnReasonsStep = exports.updateReturnReasonStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateReturnReasonStepId = "update-return-reasons";
/**
 * This step updates return reasons matching the specified filters.
 *
 * @example
 * const data = updateReturnReasonsStep({
 *   selector: {
 *     id: "rr_123",
 *   },
 *   update: {
 *     value: "damaged",
 *   }
 * })
 */
exports.updateReturnReasonsStep = (0, workflows_sdk_1.createStep)(exports.updateReturnReasonStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevReturnReasons = await service.listReturnReasons(data.selector, {
        select: selects,
        relations,
    });
    const reasons = await service.updateReturnReasons(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(reasons, prevReturnReasons);
}, async (prevReturnReasons, { container }) => {
    if (!prevReturnReasons) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await (0, utils_1.promiseAll)(prevReturnReasons.map((c) => service.updateReturnReasons(c.id, {
        value: c.value,
        label: c.label,
        description: c.description,
        metadata: c.metadata,
    })));
});
//# sourceMappingURL=update-return-reasons.js.map