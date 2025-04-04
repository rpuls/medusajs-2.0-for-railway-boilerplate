"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePromotionsWorkflow = exports.updatePromotionsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const steps_1 = require("../steps");
const update_promotions_status_1 = require("./update-promotions-status");
exports.updatePromotionsWorkflowId = "update-promotions";
/**
 * This workflow updates one or more promotions. It's used by the [Update Promotion Admin API Route](https://docs.medusajs.com/api/admin#promotions_postpromotionsid).
 *
 * This workflow has a hook that allows you to perform custom actions on the updated promotion. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the promotions.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around updating promotions.
 *
 * @example
 * const { result } = await updatePromotionsWorkflow(container)
 * .run({
 *   input: {
 *     promotionsData: [
 *       {
 *         id: "promo_123",
 *         code: "10OFF",
 *       }
 *     ],
 *     additional_data: {
 *       external_id: "123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more promotions.
 *
 * @property hooks.promotionsUpdated - This hook is executed after the promotions are updated. You can consume this hook to perform custom actions on the updated promotions.
 */
exports.updatePromotionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updatePromotionsWorkflowId, (input) => {
    const promotionIds = (0, workflows_sdk_1.transform)({ input }, ({ input }) => input.promotionsData.map((pd) => pd.id));
    const promotions = (0, common_1.useRemoteQueryStep)({
        entry_point: "promotion",
        variables: { id: promotionIds },
        fields: ["id", "status"],
        list: true,
        throw_if_key_not_found: true,
    }).config({ name: "get-promotions" });
    const promotionInputs = (0, workflows_sdk_1.transform)({ promotions, input }, ({ promotions, input }) => {
        const promotionMap = {};
        const promotionsUpdateInput = [];
        const promotionsStatusUpdateInput = [];
        for (const promotion of promotions) {
            promotionMap[promotion.id] = promotion;
        }
        for (const promotionUpdateData of input.promotionsData) {
            const promotion = promotionMap[promotionUpdateData.id];
            const { status, ...rest } = promotionUpdateData;
            promotionsUpdateInput.push(rest);
            if ((0, utils_1.isString)(status) &&
                promotionUpdateData.status !== promotion.status) {
                promotionsStatusUpdateInput.push({
                    id: promotionUpdateData.id,
                    status,
                });
            }
        }
        return { promotionsUpdateInput, promotionsStatusUpdateInput };
    });
    const updatedPromotions = (0, steps_1.updatePromotionsStep)(promotionInputs.promotionsUpdateInput);
    (0, workflows_sdk_1.when)({ promotionInputs }, ({ promotionInputs }) => {
        return !!promotionInputs.promotionsStatusUpdateInput?.length;
    }).then(() => {
        update_promotions_status_1.updatePromotionsStatusWorkflow.runAsStep({
            input: {
                promotionsData: promotionInputs.promotionsStatusUpdateInput,
            },
        });
    });
    const promotionsUpdated = (0, workflows_sdk_1.createHook)("promotionsUpdated", {
        promotions: updatedPromotions,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedPromotions, {
        hooks: [promotionsUpdated],
    });
});
//# sourceMappingURL=update-promotions.js.map