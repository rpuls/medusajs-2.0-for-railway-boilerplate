import { ReservationItemDTO, UpdateReservationItemInput } from "../../inventory";
/**
 * The data to update the reservations.
 */
export interface UpdateReservationsWorkflowInput {
    /**
     * The reservations to update.
     */
    updates: UpdateReservationItemInput[];
}
/**
 * The updated reservations.
 */
export type UpdateReservationsWorkflowOutput = ReservationItemDTO[];
//# sourceMappingURL=update-reservations.d.ts.map