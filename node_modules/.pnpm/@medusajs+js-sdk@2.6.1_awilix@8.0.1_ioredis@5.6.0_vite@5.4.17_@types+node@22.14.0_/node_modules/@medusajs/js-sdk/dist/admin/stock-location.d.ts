import { HttpTypes, SelectParams } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class StockLocation {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    create(body: HttpTypes.AdminCreateStockLocation, query?: SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminStockLocationResponse>;
    update(id: string, body: HttpTypes.AdminUpdateStockLocation, query?: SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminStockLocationResponse>;
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminStockLocationDeleteResponse>;
    retrieve(id: string, query?: SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminStockLocationResponse>;
    list(query?: HttpTypes.AdminStockLocationListParams, headers?: ClientHeaders): Promise<HttpTypes.AdminStockLocationListResponse>;
    updateSalesChannels(id: string, body: HttpTypes.AdminUpdateStockLocationSalesChannels, headers?: ClientHeaders): Promise<HttpTypes.AdminStockLocationResponse>;
    createFulfillmentSet(id: string, body: HttpTypes.AdminCreateStockLocationFulfillmentSet, headers?: ClientHeaders): Promise<HttpTypes.AdminStockLocationResponse>;
    updateFulfillmentProviders(id: string, body: HttpTypes.AdminBatchLink, headers?: ClientHeaders): Promise<HttpTypes.AdminStockLocationResponse>;
}
//# sourceMappingURL=stock-location.d.ts.map