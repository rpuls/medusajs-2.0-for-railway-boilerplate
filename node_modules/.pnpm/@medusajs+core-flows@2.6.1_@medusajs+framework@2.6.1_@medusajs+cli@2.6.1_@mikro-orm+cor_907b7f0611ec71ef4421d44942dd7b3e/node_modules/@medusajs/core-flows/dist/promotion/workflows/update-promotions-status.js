"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePromotionsStatusWorkflow = exports.updatePromotionsStatusWorkflowId = exports.updatePromotionsValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updatePromotionsValidationStep = (0, workflows_sdk_1.createStep)("update-promotions-validation", async function ({ promotionsData }) {
    for (const promotionData of promotionsData) {
        const allowedStatuses = Object.values(utils_1.PromotionStatus);
        if (!allowedStatuses.includes(promotionData.status)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `promotion's status should be one of - ${allowedStatuses.join(", ")}`);
        }
    }
});
exports.updatePromotionsStatusWorkflowId = "update-promotions-status";
/**
 * This workflow updates the status of one or more promotions.
 *
 * This workflow has a hook that allows you to perform custom actions on the updated promotions. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the promotions.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to
 * update the status of promotions within your custom flows.
 *
 * @example
 * const { result } = await updatePromotionsStatusWorkflow(container)
 * .run({
 *   input: {
 *     promotionsData: {
 *       id: "promo_123",
 *       status: "active"
 *     },
 *     additional_data: {
 *       external_id: "ext_123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update the status of one or more promotions.
 *
 * @property hooks.promotionStatusUpdated - This hook is executed after the promotions' status is updated. You can consume this hook to perform custom actions on the updated promotions.
 */
exports.updatePromotionsStatusWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updatePromotionsStatusWorkflowId, (input) => {
    (0, exports.updatePromotionsValidationStep)(input);
    const updatedPromotions = (0, steps_1.updatePromotionsStep)(input.promotionsData);
    const promotionStatusUpdated = (0, workflows_sdk_1.createHook)("promotionStatusUpdated", {
        promotions: updatedPromotions,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedPromotions, {
        hooks: [promotionStatusUpdated],
    });
});
//# sourceMappingURL=update-promotions-status.js.map