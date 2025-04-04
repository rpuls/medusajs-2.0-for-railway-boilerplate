import { FulfillmentWorkflow, ServiceZoneDTO } from "@medusajs/framework/types";
/**
 * The updated service zones.
 */
export type UpdateServiceZonesWorkflowOutput = ServiceZoneDTO[];
export declare const updateServiceZonesWorkflowId = "update-service-zones-workflow";
/**
 * This workflow updates one or more service zones. It's used by the
 * [Update Service Zones Admin API Route](https://docs.medusajs.com/api/admin#fulfillment-sets_postfulfillmentsetsidservicezoneszone_id).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * update service zones within your custom flows.
 *
 * @example
 * const { result } = await updateServiceZonesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "serzo_123"
 *     },
 *     update: {
 *       name: "Europe"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more service zones.
 */
export declare const updateServiceZonesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<FulfillmentWorkflow.UpdateServiceZonesWorkflowInput, UpdateServiceZonesWorkflowOutput, []>;
//# sourceMappingURL=update-service-zones.d.ts.map