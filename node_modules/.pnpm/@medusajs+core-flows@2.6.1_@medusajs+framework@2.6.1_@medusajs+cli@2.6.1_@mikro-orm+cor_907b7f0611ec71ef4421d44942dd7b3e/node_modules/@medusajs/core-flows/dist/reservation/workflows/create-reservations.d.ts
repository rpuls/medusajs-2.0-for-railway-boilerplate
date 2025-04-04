import { WorkflowTypes } from "@medusajs/framework/types";
export declare const createReservationsWorkflowId = "create-reservations-workflow";
/**
 * This workflow creates one or more reservations. It's used by the
 * [Create Reservations Admin API Route](https://docs.medusajs.com/api/admin#reservations_postreservations).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create reservations in your custom flows.
 *
 * @example
 * const { result } = await createReservationsWorkflow(container)
 * .run({
 *   input: {
 *     reservations: [
 *       {
 *         inventory_item_id: "iitem_123",
 *         location_id: "sloc_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more reservations.
 */
export declare const createReservationsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<WorkflowTypes.ReservationWorkflow.CreateReservationsWorkflowInput, WorkflowTypes.ReservationWorkflow.CreateReservationsWorkflowOutput, []>;
//# sourceMappingURL=create-reservations.d.ts.map