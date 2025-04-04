import { ApiKeyDTO, FilterableApiKeyProps, UpdateApiKeyDTO } from "@medusajs/framework/types";
/**
 * The data to update API keys.
 */
export type UpdateApiKeysWorkflowInput = {
    /**
     * The filters to select the API keys to update.
     */
    selector: FilterableApiKeyProps;
    /**
     * The data to update the API keys.
     */
    update: UpdateApiKeyDTO;
};
/**
 * The updated API keys.
 */
export type UpdateApiKeysWorkflowOutput = ApiKeyDTO[];
export declare const updateApiKeysWorkflowId = "update-api-keys";
/**
 * This workflow updates one or more secret or publishable API keys. It's used by the
 * [Update API Key Admin API Route](https://docs.medusajs.com/api/admin#api-keys_postapikeysid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update API keys within your custom flows.
 *
 * @example
 * const { result } = await updateApiKeysWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "apk_123"
 *     },
 *     update: {
 *       title: "Storefront"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update secret or publishable API keys.
 */
export declare const updateApiKeysWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateApiKeysWorkflowInput, UpdateApiKeysWorkflowOutput, []>;
//# sourceMappingURL=update-api-keys.d.ts.map