import { FilterableProductVariantProps, FindConfig, ProductVariantDTO } from "@medusajs/framework/types";
/**
 * The details of the variants to retrieve.
 */
export interface GetVariantsStepInput {
    filter?: FilterableProductVariantProps;
    config?: FindConfig<ProductVariantDTO>;
}
export declare const getVariantsStepId = "get-variants";
/**
 * This step retrieves variants matching the specified filters.
 *
 * @example
 * const data = getVariantsStep({
 *   filter: {
 *     id: "variant_123"
 *   }
 * })
 */
export declare const getVariantsStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetVariantsStepInput, ProductVariantDTO[]>;
//# sourceMappingURL=get-variants.d.ts.map