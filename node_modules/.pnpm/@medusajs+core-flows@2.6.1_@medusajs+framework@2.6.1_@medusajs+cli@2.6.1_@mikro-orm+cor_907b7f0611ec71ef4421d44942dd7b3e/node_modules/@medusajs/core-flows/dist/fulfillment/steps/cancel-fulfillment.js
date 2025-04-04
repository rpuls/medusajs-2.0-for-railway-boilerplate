"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelFulfillmentStep = exports.cancelFulfillmentStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.cancelFulfillmentStepId = "cancel-fulfillment";
/**
 * This step cancels a fulfillment.
 */
exports.cancelFulfillmentStep = (0, workflows_sdk_1.createStep)(exports.cancelFulfillmentStepId, async (id, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.cancelFulfillment(id);
    return new workflows_sdk_1.StepResponse(void 0, id);
});
//# sourceMappingURL=cancel-fulfillment.js.map