import { ProductTypes } from "@medusajs/framework/types";
/**
 * The data to identify and update the product collections.
 */
export type UpdateCollectionsStepInput = {
    /**
     * The filters to select the collections to update.
     */
    selector: ProductTypes.FilterableProductCollectionProps;
    /**
     * The data to update the collections with.
     */
    update: ProductTypes.UpdateProductCollectionDTO;
};
export declare const updateCollectionsStepId = "update-collections";
/**
 * This step updates collections matching the specified filters.
 *
 * @example
 * const data = updateCollectionsStep({
 *   selector: {
 *     id: "collection_123"
 *   },
 *   update: {
 *     title: "Summer Collection"
 *   }
 * })
 */
export declare const updateCollectionsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateCollectionsStepInput, ProductTypes.ProductCollectionDTO[]>;
//# sourceMappingURL=update-collections.d.ts.map