import { InventoryTypes } from "@medusajs/framework/types";
/**
 * The data to update reservation items.
 */
export type UpdateReservationsStepInput = InventoryTypes.UpdateReservationItemInput[];
export declare const updateReservationsStepId = "update-reservations-step";
/**
 * This step updates one or more reservations.
 *
 * @example
 * const data = updateReservationsStep([
 *   {
 *     id: "res_123",
 *     quantity: 1,
 *   }
 * ])
 */
export declare const updateReservationsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateReservationsStepInput, InventoryTypes.ReservationItemDTO[]>;
//# sourceMappingURL=update-reservations.d.ts.map