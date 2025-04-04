/**
 * The data to delete the reservations.
 */
type WorkflowInput = {
    /**
     * The IDs of the reservations to delete.
     */
    ids: string[];
};
export declare const deleteReservationsWorkflowId = "delete-reservations";
/**
 * This workflow deletes one or more reservations. It's used by the
 * [Delete Reservations Admin API Route](https://docs.medusajs.com/api/admin#reservations_deletereservationsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete reservations in your custom flows.
 *
 * @example
 * const { result } = await deleteReservationsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["res_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more reservations.
 */
export declare const deleteReservationsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<WorkflowInput, unknown, any[]>;
export {};
//# sourceMappingURL=delete-reservations.d.ts.map