import { UpdateLineItemWithSelectorDTO } from "@medusajs/framework/types";
export declare const updateLineItemsStepWithSelectorId = "update-line-items-with-selector";
/**
 * This step updates line items.
 *
 * @example
 * const data = updateLineItemsStepWithSelector({
 *   selector: {
 *     cart_id: "cart_123"
 *   },
 *   data: {
 *     quantity: 1
 *   }
 * })
 */
export declare const updateLineItemsStepWithSelector: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateLineItemWithSelectorDTO, import("@medusajs/framework/types").CartLineItemDTO[]>;
//# sourceMappingURL=update-line-items.d.ts.map