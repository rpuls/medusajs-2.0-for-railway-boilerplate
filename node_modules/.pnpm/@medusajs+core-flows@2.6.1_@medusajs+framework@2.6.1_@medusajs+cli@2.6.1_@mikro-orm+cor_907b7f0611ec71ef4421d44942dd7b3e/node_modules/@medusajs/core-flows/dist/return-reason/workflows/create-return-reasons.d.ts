import { CreateOrderReturnReasonDTO, OrderReturnReasonDTO } from "@medusajs/framework/types";
/**
 * The data to create return reasons.
 */
export type CreateReturnReasonsWorkflowInput = {
    /**
     * The return reasons to create.
     */
    data: CreateOrderReturnReasonDTO[];
};
/**
 * The created return reasons.
 */
export type CreateReturnReasonsWorkflowOutput = OrderReturnReasonDTO[];
export declare const createReturnReasonsWorkflowId = "create-return-reasons";
/**
 * This workflow creates one or more return reasons. It's used by the
 * [Create Return Reason Admin API Route](https://docs.medusajs.com/api/admin#return-reasons_postreturnreasons).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create return reasons within your custom flows.
 *
 * @example
 * const { result } = await createReturnReasonsWorkflow(container)
 * .run({
 *   input: {
 *     data: [
 *       {
 *         label: "Damaged",
 *         value: "damaged",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create return reasons.
 */
export declare const createReturnReasonsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateReturnReasonsWorkflowInput, CreateReturnReasonsWorkflowOutput, []>;
//# sourceMappingURL=create-return-reasons.d.ts.map