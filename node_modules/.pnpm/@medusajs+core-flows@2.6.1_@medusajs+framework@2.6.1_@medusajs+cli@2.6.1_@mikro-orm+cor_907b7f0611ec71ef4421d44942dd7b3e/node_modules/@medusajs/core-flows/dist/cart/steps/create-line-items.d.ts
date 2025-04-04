import { CreateLineItemForCartDTO } from "@medusajs/framework/types";
/**
 * The details of the line items to create.
 */
export interface CreateLineItemsCartStepInput {
    /**
     * The ID of the cart to create line items for.
     */
    id: string;
    /**
     * The line items to create.
     */
    items: CreateLineItemForCartDTO[];
}
export declare const createLineItemsStepId = "create-line-items-step";
/**
 * This step creates line item in a cart.
 *
 * @example
 * const data = createLineItemsStep({
 *   "id": "cart_123",
 *   "items": [{
 *     "title": "Shirt",
 *     "quantity": 1,
 *     "unit_price": 20,
 *     "cart_id": "cart_123",
 *   }]
 * })
 */
export declare const createLineItemsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateLineItemsCartStepInput, import("@medusajs/framework/types").CartLineItemDTO[]>;
//# sourceMappingURL=create-line-items.d.ts.map