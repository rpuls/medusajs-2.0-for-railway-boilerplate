import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class ReturnReason {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    list(query?: HttpTypes.AdminReturnReasonListParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnReasonListResponse>;
    retrieve(id: string, query?: HttpTypes.AdminReturnReasonParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnReasonResponse>;
    create(body: HttpTypes.AdminCreateReturnReason, query?: HttpTypes.AdminReturnReasonParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnReasonResponse>;
    update(id: string, body: HttpTypes.AdminUpdateReturnReason, query?: HttpTypes.AdminReturnReasonParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnReasonResponse>;
    delete(id: string, query?: HttpTypes.AdminReturnReasonParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnReasonDeleteResponse>;
}
//# sourceMappingURL=return-reason.d.ts.map