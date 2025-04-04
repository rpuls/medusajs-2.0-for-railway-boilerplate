import { FilterableApiKeyProps, RevokeApiKeyDTO } from "@medusajs/framework/types";
/**
 * The data to revoke API keys.
 */
export type RevokeApiKeysStepInput = {
    /**
     * The filters to select the API keys to revoke.
     */
    selector: FilterableApiKeyProps;
    /**
     * The data to revoke the API keys.
     */
    revoke: RevokeApiKeyDTO;
};
export declare const revokeApiKeysStepId = "revoke-api-keys";
/**
 * This step revokes one or more API keys.
 *
 * @example
 * const data = revokeApiKeysStep({
 *   selector: {
 *     id: "apk_123"
 *   },
 *   revoke: {
 *     revoked_by: "user_123"
 *   }
 * })
 */
export declare const revokeApiKeysStep: import("@medusajs/framework/workflows-sdk").StepFunction<RevokeApiKeysStepInput, import("@medusajs/framework/types").ApiKeyDTO[]>;
//# sourceMappingURL=revoke-api-keys.d.ts.map