import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
declare class Reservation {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    retrieve(id: string, query?: HttpTypes.AdminReservationParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReservationResponse>;
    list(query?: HttpTypes.AdminGetReservationsParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReservationListResponse>;
    create(body: HttpTypes.AdminCreateReservation, query?: HttpTypes.AdminGetReservationsParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReservationResponse>;
    update(id: string, body: HttpTypes.AdminUpdateReservation, query?: HttpTypes.AdminGetReservationsParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReservationResponse>;
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminReservationDeleteResponse>;
}
export default Reservation;
//# sourceMappingURL=reservation.d.ts.map