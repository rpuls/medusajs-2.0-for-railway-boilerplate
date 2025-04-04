import { WorkflowTypes } from "@medusajs/framework/types";
export declare const updateReservationsWorkflowId = "update-reservations-workflow";
/**
 * This workflow updates one or more reservations. It's used by the
 * [Update Reservations Admin API Route](https://docs.medusajs.com/api/admin#reservations_postreservationsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update reservations in your custom flows.
 *
 * @example
 * const { result } = await updateReservationsWorkflow(container)
 * .run({
 *   input: {
 *     updates: [
 *       {
 *         id: "res_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update one or more reservations.
 */
export declare const updateReservationsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<WorkflowTypes.ReservationWorkflow.UpdateReservationsWorkflowInput, WorkflowTypes.ReservationWorkflow.UpdateReservationsWorkflowOutput, []>;
//# sourceMappingURL=update-reservations.d.ts.map