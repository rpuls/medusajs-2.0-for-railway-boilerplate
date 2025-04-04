import { CreateApiKeyDTO } from "@medusajs/framework/types";
/**
 * The data to create API keys.
 */
export type CreateApiKeysStepInput = {
    /**
     * The API keys to create.
     */
    api_keys: CreateApiKeyDTO[];
};
export declare const createApiKeysStepId = "create-api-keys";
/**
 * This step creates one or more API keys.
 *
 * @example
 * const data = createApiKeysStep({
 *   api_keys: [
 *     {
 *       type: "publishable",
 *       title: "Storefront",
 *       created_by: "user_123"
 *     }
 *   ]
 * })
 */
export declare const createApiKeysStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateApiKeysStepInput, import("@medusajs/framework/types").ApiKeyDTO[]>;
//# sourceMappingURL=create-api-keys.d.ts.map