import { CreateRefundReasonDTO, RefundReasonDTO } from "@medusajs/framework/types";
/**
 * The data to create refund reasons.
 */
export type CreateRefundReasonsWorkflowInput = {
    /**
     * The refund reasons to create.
     */
    data: CreateRefundReasonDTO[];
};
export declare const createRefundReasonsWorkflowId = "create-refund-reasons-workflow";
/**
 * This workflow creates one or more refund reasons. It's used by the
 * [Create Refund Reason Admin API Route](https://docs.medusajs.com/api/admin#refund-reasons_postrefundreasons).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create refund reasons in your custom flows.
 *
 * @example
 * const { result } = await createRefundReasonsWorkflow(container)
 * .run({
 *   input: {
 *     data: [
 *       {
 *         label: "damaged",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create refund reasons.
 */
export declare const createRefundReasonsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateRefundReasonsWorkflowInput, RefundReasonDTO[], []>;
//# sourceMappingURL=create-refund-reasons.d.ts.map