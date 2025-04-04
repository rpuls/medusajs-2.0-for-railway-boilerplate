/**
 * The ID of the shipment to validate.
 */
export type ValidateShipmentStepInput = string;
export declare const validateShipmentStepId = "validate-shipment";
/**
 * This step validates that a shipment can be created for a fulfillment.
 * If the shipment has already been created, the fulfillment has been canceled,
 * or the fulfillment does not have a shipping option, the step throws an error.
 */
export declare const validateShipmentStep: import("@medusajs/framework/workflows-sdk").StepFunction<string, undefined>;
//# sourceMappingURL=validate-shipment.d.ts.map