import { FilterableApiKeyProps, UpdateApiKeyDTO } from "@medusajs/framework/types";
/**
 * The data to update API keys.
 */
export type UpdateApiKeysStepInput = {
    /**
     * The filters to select the API keys to update.
     */
    selector: FilterableApiKeyProps;
    /**
     * The data to update the API keys.
     */
    update: UpdateApiKeyDTO;
};
export declare const updateApiKeysStepId = "update-api-keys";
/**
 * This step updates one or more API keys.
 *
 * @example
 * const data = updateApiKeysStep({
 *   selector: {
 *     id: "apk_123"
 *   },
 *   update: {
 *     title: "Storefront"
 *   }
 * })
 */
export declare const updateApiKeysStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateApiKeysStepInput, import("@medusajs/framework/types").ApiKeyDTO[]>;
//# sourceMappingURL=update-api-keys.d.ts.map