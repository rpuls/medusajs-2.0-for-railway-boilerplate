"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPromotionsStep = exports.createPromotionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createPromotionsStepId = "create-promotions";
/**
 * This step creates one or more promotions.
 *
 * @example
 * const data = createPromotionsStep([
 *   {
 *     code: "10OFF",
 *     type: "standard",
 *     application_method: {
 *       type: "percentage",
 *       value: 10,
 *       target_type: "items"
 *     }
 *   }
 * ])
 */
exports.createPromotionsStep = (0, workflows_sdk_1.createStep)(exports.createPromotionsStepId, async (data, { container }) => {
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    const createdPromotions = await promotionModule.createPromotions(data);
    return new workflows_sdk_1.StepResponse(createdPromotions, createdPromotions.map((createdPromotions) => createdPromotions.id));
}, async (createdPromotionIds, { container }) => {
    if (!createdPromotionIds?.length) {
        return;
    }
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    await promotionModule.deletePromotions(createdPromotionIds);
});
//# sourceMappingURL=create-promotions.js.map