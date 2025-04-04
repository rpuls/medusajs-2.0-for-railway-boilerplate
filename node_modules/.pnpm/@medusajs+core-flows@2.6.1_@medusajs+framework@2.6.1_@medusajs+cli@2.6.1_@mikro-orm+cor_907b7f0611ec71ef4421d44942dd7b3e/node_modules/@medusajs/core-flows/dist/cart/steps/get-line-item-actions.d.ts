import { CreateLineItemForCartDTO, UpdateLineItemWithoutSelectorDTO, UpdateLineItemWithSelectorDTO } from "@medusajs/framework/types";
/**
 * The details of the line items to create or update.
 */
export interface GetLineItemActionsStepInput {
    /**
     * The ID of the cart to create line items for.
     */
    id: string;
    /**
     * The line items to create or update.
     */
    items: CreateLineItemForCartDTO[];
}
export interface GetLineItemActionsStepOutput {
    /**
     * The line items to create.
     */
    itemsToCreate: CreateLineItemForCartDTO[];
    /**
     * The line items to update.
     */
    itemsToUpdate: UpdateLineItemWithSelectorDTO[] | UpdateLineItemWithoutSelectorDTO[];
}
export declare const getLineItemActionsStepId = "get-line-item-actions-step";
/**
 * This step returns lists of cart line items to create or update based on the
 * provided input.
 *
 * @example
 * const data = getLineItemActionsStep({
 *   "id": "cart_123",
 *   "items": [{
 *     "title": "Shirt",
 *     "quantity": 1,
 *     "unit_price": 50,
 *     "cart_id": "cart_123",
 *   }]
 * })
 */
export declare const getLineItemActionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetLineItemActionsStepInput, GetLineItemActionsStepOutput>;
//# sourceMappingURL=get-line-item-actions.d.ts.map