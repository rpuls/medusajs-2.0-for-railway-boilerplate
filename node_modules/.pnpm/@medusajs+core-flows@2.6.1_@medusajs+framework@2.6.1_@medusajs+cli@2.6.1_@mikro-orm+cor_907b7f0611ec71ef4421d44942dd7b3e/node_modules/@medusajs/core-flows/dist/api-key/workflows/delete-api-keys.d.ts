/**
 * The data to delete API keys.
 */
export type DeleteApiKeysWorkflowInput = {
    /**
     * The IDs of the API keys to delete.
     */
    ids: string[];
};
export declare const deleteApiKeysWorkflowId = "delete-api-keys";
/**
 * This workflow deletes one or more secret or publishable API keys. It's used by the
 * [Delete API Key Admin API Route](https://docs.medusajs.com/api/admin#api-keys_deleteapikeysid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete API keys within your custom flows.
 *
 * @example
 * const { result } = await deleteApiKeysWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["apk_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete secret or publishable API keys.
 */
export declare const deleteApiKeysWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteApiKeysWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-api-keys.d.ts.map