import { InventoryTypes } from "@medusajs/framework/types";
/**
 * The data to create reservation items.
 */
export type CreateReservationsStepInput = InventoryTypes.CreateReservationItemInput[];
export declare const createReservationsStepId = "create-reservations-step";
/**
 * This step creates one or more reservations.
 *
 * @example
 * const data = createReservationsStep([
 *   {
 *     inventory_item_id: "iitem_123",
 *     location_id: "sloc_123",
 *     quantity: 1,
 *   }
 * ])
 */
export declare const createReservationsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateReservationsStepInput, InventoryTypes.ReservationItemDTO[]>;
//# sourceMappingURL=create-reservations.d.ts.map