/**
 * The data to delete one or more fulfillment sets.
 */
export type DeleteFulfillmentSetsWorkflowInput = {
    /**
     * The IDs of the fulfillment sets to delete.
     */
    ids: string[];
};
export declare const deleteFulfillmentSetsWorkflowId = "delete-fulfillment-sets-workflow";
/**
 * This workflow deletes one or more fulfillment sets. It's used by the
 * [Delete Fulfillment Sets Admin API Route](https://docs.medusajs.com/api/admin#fulfillment-sets_deletefulfillmentsetsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * delete fulfillment sets within your custom flows.
 *
 * @example
 * const { result } = await deleteFulfillmentSetsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["fulset_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more fulfillment sets.
 */
export declare const deleteFulfillmentSetsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteFulfillmentSetsWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-fulfillment-sets.d.ts.map