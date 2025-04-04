import { CreateReservationItemInput, ReservationItemDTO } from "../../inventory";
/**
 * The data to create the reservations.
 */
export interface CreateReservationsWorkflowInput {
    /**
     * The reservations to create.
     */
    reservations: CreateReservationItemInput[];
}
/**
 * The created reservations.
 */
export type CreateReservationsWorkflowOutput = ReservationItemDTO[];
//# sourceMappingURL=create-reservations.d.ts.map