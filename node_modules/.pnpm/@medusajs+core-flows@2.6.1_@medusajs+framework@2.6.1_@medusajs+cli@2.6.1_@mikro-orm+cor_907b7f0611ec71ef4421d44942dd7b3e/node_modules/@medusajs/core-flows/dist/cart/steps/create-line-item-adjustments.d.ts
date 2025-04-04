import { CreateLineItemAdjustmentDTO } from "@medusajs/framework/types";
/**
 * The details of the line item adjustments to create.
 */
export interface CreateLineItemAdjustmentsCartStepInput {
    /**
     * The line item adjustments to create.
     */
    lineItemAdjustmentsToCreate: CreateLineItemAdjustmentDTO[];
}
export declare const createLineItemAdjustmentsStepId = "create-line-item-adjustments";
/**
 * This step creates line item adjustments in a cart, such as when a promotion is applied.
 *
 * @example
 * createLineItemAdjustmentsStep({
 *   lineItemAdjustmentsToCreate: [
 *     {
 *       item_id: "litem_123",
 *       code: "10OFF",
 *       amount: 10,
 *     }
 *   ]
 * })
 */
export declare const createLineItemAdjustmentsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateLineItemAdjustmentsCartStepInput, never[] | undefined>;
//# sourceMappingURL=create-line-item-adjustments.d.ts.map