import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class RefundReason {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    list(query?: HttpTypes.RefundReasonFilters, headers?: ClientHeaders): Promise<HttpTypes.RefundReasonsResponse>;
}
//# sourceMappingURL=refund-reasons.d.ts.map