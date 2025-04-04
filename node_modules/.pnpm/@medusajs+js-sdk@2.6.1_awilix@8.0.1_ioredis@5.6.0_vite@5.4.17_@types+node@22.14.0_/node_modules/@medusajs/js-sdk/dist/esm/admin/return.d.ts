import { HttpTypes, SelectParams } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class Return {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    list(query?: HttpTypes.AdminReturnFilters, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnsResponse>;
    retrieve(id: string, query?: SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    initiateRequest(body: HttpTypes.AdminInitiateReturnRequest, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    cancel(id: string, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    cancelRequest(id: string, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    addReturnItem(id: string, body: HttpTypes.AdminAddReturnItems, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    updateReturnItem(id: string, actionId: string, body: HttpTypes.AdminUpdateReturnItems, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    removeReturnItem(id: string, actionId: string, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    addReturnShipping(id: string, body: HttpTypes.AdminAddReturnShipping, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    updateReturnShipping(id: string, actionId: string, body: HttpTypes.AdminAddReturnShipping, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    deleteReturnShipping(id: string, actionId: string, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    updateRequest(id: string, body: HttpTypes.AdminUpdateReturnRequest, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    confirmRequest(id: string, body: HttpTypes.AdminConfirmReturnRequest, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    initiateReceive(id: string, body: HttpTypes.AdminInitiateReceiveReturn, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    receiveItems(id: string, body: HttpTypes.AdminReceiveItems, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    updateReceiveItem(id: string, actionId: string, body: HttpTypes.AdminUpdateReceiveItems, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    removeReceiveItem(id: string, actionId: string, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    dismissItems(id: string, body: HttpTypes.AdminDismissItems, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    updateDismissItem(id: string, actionId: string, body: HttpTypes.AdminUpdateDismissItems, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    removeDismissItem(id: string, actionId: string, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    confirmReceive(id: string, body: HttpTypes.AdminConfirmReceiveReturn, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
    cancelReceive(id: string, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminReturnResponse>;
}
//# sourceMappingURL=return.d.ts.map