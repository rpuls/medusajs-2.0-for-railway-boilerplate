import { LinkWorkflowInput } from "@medusajs/framework/types";
export declare const batchLinkProductsToCollectionStepId = "batch-link-products-to-collection";
/**
 * This step manages the links between a collection and products.
 *
 * @example
 * const data = batchLinkProductsToCollectionStep({
 *   id: "collection_123",
 *   add: ["product_123"],
 *   remove: ["product_321"]
 * })
 */
export declare const batchLinkProductsToCollectionStep: import("@medusajs/framework/workflows-sdk").StepFunction<LinkWorkflowInput, undefined>;
//# sourceMappingURL=batch-link-products-collection.d.ts.map