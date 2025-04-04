import { UpdateLineItemWithoutSelectorDTO, UpdateLineItemWithSelectorDTO } from "@medusajs/framework/types";
/**
 * The details of the line items to update.
 */
export interface UpdateLineItemsStepInput {
    /**
     * The ID of the cart that the line items belong to.
     */
    id: string;
    /**
     * The line items to update.
     */
    items: (UpdateLineItemWithSelectorDTO | UpdateLineItemWithoutSelectorDTO)[];
}
export declare const updateLineItemsStepId = "update-line-items-step";
/**
 * This step updates a cart's line items.
 *
 * @example
 * const data = updateLineItemsStep({
 *   id: "cart_123",
 *   items: [
 *     {
 *       selector: {
 *         id: "line_item_123"
 *       },
 *       data: {
 *         quantity: 2
 *       }
 *     }
 *   ]
 * })
 */
export declare const updateLineItemsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateLineItemsStepInput, import("@medusajs/framework/types").CartLineItemDTO[]>;
//# sourceMappingURL=update-line-items.d.ts.map