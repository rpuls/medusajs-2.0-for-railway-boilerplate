/**
 * The data to validate fulfillment providers.
 */
export type FulfillmentProviderValidationWorkflowInput = {
    /**
     * The ID of the shipping option to validate.
     */
    id?: string;
    /**
     * The ID of the shipping option's service zone.
     */
    service_zone_id?: string;
    /**
     * The ID of the fulfillment provider to validate.
     */
    provider_id?: string;
};
export declare const validateFulfillmentProvidersStepId = "validate-fulfillment-providers-step";
/**
 * This step validates that the specified fulfillment providers are available in the
 * specified service zones. If the service zone or provider ID are not specified, or
 * the provider is not available in the service zone, the step throws an error.
 */
export declare const validateFulfillmentProvidersStep: import("@medusajs/framework/workflows-sdk").StepFunction<FulfillmentProviderValidationWorkflowInput[], undefined>;
//# sourceMappingURL=validate-fulfillment-providers.d.ts.map