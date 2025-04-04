import { FilterableProductProps } from "@medusajs/framework/types";
/**
 * The configuration to retrieve the products.
 */
export type GetAllProductsStepInput = {
    /**
     * The fields to select. These fields will be passed to
     * [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query), so you can
     * pass product properties or any relation names, including custom links.
     */
    select: string[];
    /**
     * The filters to select which products to retrieve.
     */
    filter?: FilterableProductProps;
};
export declare const getAllProductsStepId = "get-all-products";
/**
 * This step retrieves all products matching a set of filters.
 *
 * @example
 * To retrieve all products:
 *
 * ```ts
 * const data = getAllProductsStep({
 *   select: ["*"],
 * })
 * ```
 *
 * To retrieve all products matching a filter:
 *
 * ```ts
 * const data = getAllProductsStep({
 *   select: ["*"],
 *   filter: {
 *     collection_id: "collection_123"
 *   }
 * })
 */
export declare const getAllProductsStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetAllProductsStepInput, any[]>;
//# sourceMappingURL=get-all-products.d.ts.map