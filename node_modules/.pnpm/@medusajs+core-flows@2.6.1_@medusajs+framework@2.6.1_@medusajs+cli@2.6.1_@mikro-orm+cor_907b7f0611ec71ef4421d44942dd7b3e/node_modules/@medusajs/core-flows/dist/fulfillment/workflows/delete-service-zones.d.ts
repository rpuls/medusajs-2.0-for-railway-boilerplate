/**
 * The data to delete one or more service zones.
 */
export type DeleteServiceZonesWorkflowInput = {
    /**
     * The IDs of the service zones to delete.
     */
    ids: string[];
};
export declare const deleteServiceZonesWorkflowId = "delete-service-zones-workflow";
/**
 * This workflow deletes one or more service zones. It's used by the
 * [Remove Service Zones from Fulfillment Set Admin API Route](https://docs.medusajs.com/api/admin#fulfillment-sets_deletefulfillmentsetsidservicezoneszone_id).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * delete service zones within your custom flows.
 *
 * @example
 * const { result } = await deleteServiceZonesWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["serzo_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more service zones.
 */
export declare const deleteServiceZonesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteServiceZonesWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-service-zones.d.ts.map