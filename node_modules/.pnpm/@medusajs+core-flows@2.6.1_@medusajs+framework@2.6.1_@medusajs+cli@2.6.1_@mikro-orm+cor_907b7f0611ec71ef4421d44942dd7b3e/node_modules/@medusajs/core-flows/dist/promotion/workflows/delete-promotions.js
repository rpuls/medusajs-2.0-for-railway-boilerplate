"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePromotionsWorkflow = exports.deletePromotionsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.deletePromotionsWorkflowId = "delete-promotions";
/**
 * This workflow deletes one or more promotions. It's used by the
 * [Delete Promotions Admin API Route](https://docs.medusajs.com/api/admin#promotions_deletepromotionsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * delete promotions within your custom flows.
 *
 * @example
 * const { result } = await deletePromotionsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["promo_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more promotions.
 */
exports.deletePromotionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deletePromotionsWorkflowId, (input) => {
    const deletedPromotions = (0, steps_1.deletePromotionsStep)(input.ids);
    const promotionsDeleted = (0, workflows_sdk_1.createHook)("promotionsDeleted", {
        ids: input.ids,
    });
    return new workflows_sdk_1.WorkflowResponse(deletedPromotions, {
        hooks: [promotionsDeleted],
    });
});
//# sourceMappingURL=delete-promotions.js.map