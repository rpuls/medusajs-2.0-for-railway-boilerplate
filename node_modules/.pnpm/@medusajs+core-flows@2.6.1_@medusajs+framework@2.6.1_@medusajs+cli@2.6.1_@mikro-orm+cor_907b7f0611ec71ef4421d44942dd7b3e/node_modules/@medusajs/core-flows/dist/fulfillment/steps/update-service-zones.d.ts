import { FulfillmentWorkflow } from "@medusajs/framework/types";
export declare const updateServiceZonesStepId = "update-service-zones";
/**
 * This step updates service zones matching the specified filters.
 *
 * @example
 * const data = updateServiceZonesStep({
 *   selector: {
 *     id: "serzo_123"
 *   },
 *   update: {
 *     name: "US",
 *   }
 * })
 */
export declare const updateServiceZonesStep: import("@medusajs/framework/workflows-sdk").StepFunction<FulfillmentWorkflow.UpdateServiceZonesWorkflowInput, import("@medusajs/framework/types").ServiceZoneDTO[]>;
//# sourceMappingURL=update-service-zones.d.ts.map