import { CartLineItemDTO, FilterableLineItemProps, FindConfig } from "@medusajs/framework/types";
/**
 * The data to list line items.
 */
export interface ListLineItemsStepInput {
    /**
     * The filters to select the line items.
     */
    filters: FilterableLineItemProps;
    /**
     * Configurations to select the line items' fields
     * and relations, and to paginate the results.
     *
     * Learn more in the [service factory reference](https://docs.medusajs.com/resources/service-factory-reference/methods/list).
     */
    config?: FindConfig<CartLineItemDTO>;
}
export declare const listLineItemsStepId = "list-line-items";
/**
 * This step retrieves a list of a cart's line items
 * matching the specified filters.
 *
 * @example
 * To retrieve the line items of a cart:
 *
 * ```ts
 * const data = listLineItemsStep({
 *   filters: {
 *     cart_id: "cart_123"
 *   },
 *   config: {
 *     select: ["*"]
 *   }
 * })
 * ```
 *
 * To retrieve the line items of a cart with pagination:
 *
 * ```ts
 * const data = listLineItemsStep({
 *   filters: {
 *     cart_id: "cart_123"
 *   },
 *   config: {
 *     select: ["*"],
 *     skip: 0,
 *     take: 15
 *   }
 * })
 * ```
 *
 * Learn more about listing items in [this service factory reference](https://docs.medusajs.com/resources/service-factory-reference/methods/list).
 */
export declare const listLineItemsStep: import("@medusajs/framework/workflows-sdk").StepFunction<ListLineItemsStepInput, CartLineItemDTO[]>;
//# sourceMappingURL=list-line-items.d.ts.map