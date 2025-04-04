import { RefundReasonDTO, UpdateRefundReasonDTO } from "@medusajs/framework/types";
/**
 * The refund reasons to update.
 */
export type UpdateRefundReasonsWorkflowInput = UpdateRefundReasonDTO[];
/**
 * The updated refund reasons.
 */
export type UpdateRefundReasonsWorkflowOutput = RefundReasonDTO[];
export declare const updateRefundReasonsWorkflowId = "update-refund-reasons";
/**
 * This workflow updates one or more refund reasons. It's used by the
 * [Update Refund Reason Admin API Route](https://docs.medusajs.com/api/admin#refund-reasons_postrefundreasonsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update refund reasons in your custom flows.
 *
 * @example
 * const { result } = await updateRefundReasonsWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       id: "refres_123",
 *       label: "Damaged",
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Update refund reasons.
 */
export declare const updateRefundReasonsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateRefundReasonsWorkflowInput, UpdateRefundReasonsWorkflowOutput, []>;
//# sourceMappingURL=update-refund-reasons.d.ts.map