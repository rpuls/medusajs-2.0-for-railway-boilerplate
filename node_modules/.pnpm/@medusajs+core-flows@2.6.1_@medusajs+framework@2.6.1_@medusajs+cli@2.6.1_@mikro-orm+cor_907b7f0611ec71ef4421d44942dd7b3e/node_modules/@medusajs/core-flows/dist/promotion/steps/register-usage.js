"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUsageStep = exports.registerUsageStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.registerUsageStepId = "register-usage";
/**
 * This step registers usage for a promotion.
 */
exports.registerUsageStep = (0, workflows_sdk_1.createStep)(exports.registerUsageStepId, async (data, { container }) => {
    if (!data.length) {
        return new workflows_sdk_1.StepResponse(null, []);
    }
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    await promotionModule.registerUsage(data);
    return new workflows_sdk_1.StepResponse(null, data);
}, async (revertData, { container }) => {
    if (!revertData?.length) {
        return;
    }
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    await promotionModule.revertUsage(revertData);
});
//# sourceMappingURL=register-usage.js.map