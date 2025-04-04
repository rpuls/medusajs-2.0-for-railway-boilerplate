"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePromotionsStep = exports.deletePromotionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deletePromotionsStepId = "delete-promotions";
/**
 * This step deletes one or more promotions.
 */
exports.deletePromotionsStep = (0, workflows_sdk_1.createStep)(exports.deletePromotionsStepId, async (ids, { container }) => {
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    await promotionModule.softDeletePromotions(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (idsToRestore, { container }) => {
    if (!idsToRestore?.length) {
        return;
    }
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    await promotionModule.restorePromotions(idsToRestore);
});
//# sourceMappingURL=delete-promotions.js.map