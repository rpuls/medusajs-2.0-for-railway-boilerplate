import { StoreDTO, StoreWorkflow } from "@medusajs/framework/types";
/**
 * The updated stores.
 */
export type UpdateStoresWorkflowOutput = StoreDTO[];
export declare const updateStoresWorkflowId = "update-stores";
/**
 * This workflow updates stores matching the specified filters. It's used by the
 * [Update Store Admin API Route](https://docs.medusajs.com/api/admin#stores_poststoresid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update stores within your custom flows.
 *
 * @example
 * const { result } = await updateStoresWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "store_123"
 *     },
 *     update: {
 *       name: "Acme"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update stores.
 */
export declare const updateStoresWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<StoreWorkflow.UpdateStoreWorkflowInput, UpdateStoresWorkflowOutput, []>;
//# sourceMappingURL=update-stores.d.ts.map