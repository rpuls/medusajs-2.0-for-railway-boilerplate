"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReturnsStep = exports.createReturnsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createReturnsStepId = "create-returns";
/**
 * This step creates returns.
 */
exports.createReturnsStep = (0, workflows_sdk_1.createStep)(exports.createReturnsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const orderReturns = await service.createReturns(data);
    const returnIds = orderReturns.map((ret) => ret.id);
    return new workflows_sdk_1.StepResponse(orderReturns, returnIds);
}, async (returnIds, { container }) => {
    if (!returnIds) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.deleteReturns(returnIds);
});
//# sourceMappingURL=create-returns.js.map