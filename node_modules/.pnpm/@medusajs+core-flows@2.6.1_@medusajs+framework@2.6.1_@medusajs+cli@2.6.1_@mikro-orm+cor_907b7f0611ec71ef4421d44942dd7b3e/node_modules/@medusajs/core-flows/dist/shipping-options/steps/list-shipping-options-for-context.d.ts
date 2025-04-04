import { FindConfig, ShippingOptionDTO } from "@medusajs/framework/types";
/**
 * The data to retrieve the list of shipping options.
 */
export interface ListShippingOptionsForContextStepInput {
    /**
     * The context of retrieving the shipping options. This context
     * will be compared against shipping options' rules. The key
     * of the context is a name of an attribute, and the value is
     * the attribute's value. Shipping options that have rules
     * matching this context are retrieved.
     */
    context: Record<string, unknown>;
    /**
     * The fields and relations to select in the returned shipping options,
     * along with pagination and sorting options.
     *
     * Learn more in the [service factory reference](https://docs.medusajs.com/resources/service-factory-reference/methods/list).
     */
    config?: FindConfig<ShippingOptionDTO>;
}
export declare const listShippingOptionsForContextStepId = "list-shipping-options-for-context";
/**
 * This step retrieves shipping options that can be used in the specified context, based on
 * the shipping options' rules.
 *
 * @example
 * To retrieve shipping options matching a context:
 *
 * ```ts
 * const data = listShippingOptionsForContextStep({
 *   context: {
 *     region_id: "reg_123"
 *   }
 * })
 * ```
 *
 * To retrieve shipping options matching a context with pagination:
 *
 * ```ts
 * const data = listShippingOptionsForContextStep({
 *   context: {
 *     region_id: "reg_123"
 *   },
 *   config: {
 *     skip: 0,
 *     take: 10
 *   }
 * })
 * ```
 *
 * Learn more about paginating records and selecting fields in the
 * [service factory reference](https://docs.medusajs.com/resources/service-factory-reference/methods/list).
 */
export declare const listShippingOptionsForContextStep: import("@medusajs/framework/workflows-sdk").StepFunction<ListShippingOptionsForContextStepInput, ShippingOptionDTO[]>;
//# sourceMappingURL=list-shipping-options-for-context.d.ts.map