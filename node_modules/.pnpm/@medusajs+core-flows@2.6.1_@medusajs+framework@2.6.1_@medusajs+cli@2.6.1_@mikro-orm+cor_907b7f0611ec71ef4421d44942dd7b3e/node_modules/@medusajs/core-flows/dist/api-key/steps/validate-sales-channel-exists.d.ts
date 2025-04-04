/**
 * The data to validate that the sales channels exist.
 */
export interface ValidateSalesChannelsExistStepInput {
    /**
     * The IDs of the sales channels to validate.
     */
    sales_channel_ids: string[];
}
export declare const validateSalesChannelsExistStepId = "validate-sales-channels-exist";
/**
 * This step validates that a sales channel exists before linking it to an API key.
 * If the sales channel does not exist, the step throws an error.
 */
export declare const validateSalesChannelsExistStep: import("@medusajs/framework/workflows-sdk").StepFunction<ValidateSalesChannelsExistStepInput, string[]>;
//# sourceMappingURL=validate-sales-channel-exists.d.ts.map