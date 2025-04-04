"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePromotionsStep = exports.updatePromotionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updatePromotionsStepId = "update-promotions";
/**
 * This step updates one or more promotions.
 *
 * @example
 * const data = updatePromotionsStep([
 *   {
 *     id: "promo_123",
 *     code: "10OFF"
 *   }
 * ])
 */
exports.updatePromotionsStep = (0, workflows_sdk_1.createStep)(exports.updatePromotionsStepId, async (data, { container }) => {
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(data);
    const dataBeforeUpdate = await promotionModule.listPromotions({ id: data.map((d) => d.id) }, { relations, select: selects });
    const updatedPromotions = await promotionModule.updatePromotions(data);
    return new workflows_sdk_1.StepResponse(updatedPromotions, {
        dataBeforeUpdate,
        selects,
        relations,
    });
}, async (revertInput, { container }) => {
    if (!revertInput) {
        return;
    }
    const { dataBeforeUpdate, selects, relations } = revertInput;
    const promotionModule = container.resolve(utils_1.Modules.PROMOTION);
    await promotionModule.updatePromotions(dataBeforeUpdate.map((data) => (0, utils_1.convertItemResponseToUpdateRequest)(data, selects, relations)));
});
//# sourceMappingURL=update-promotions.js.map