import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class SalesChannel {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    create(body: HttpTypes.AdminCreateSalesChannel, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminSalesChannelResponse>;
    update(id: string, body: HttpTypes.AdminUpdateSalesChannel, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminSalesChannelResponse>;
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminSalesChannelDeleteResponse>;
    retrieve(id: string, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminSalesChannelResponse>;
    list(query?: HttpTypes.AdminSalesChannelListParams, headers?: ClientHeaders): Promise<HttpTypes.AdminSalesChannelListResponse>;
    updateProducts(id: string, body: HttpTypes.AdminUpdateSalesChannelProducts, headers?: ClientHeaders): Promise<HttpTypes.AdminSalesChannelResponse>;
    batchProducts(id: string, body: HttpTypes.AdminBatchLink, headers?: ClientHeaders): Promise<HttpTypes.AdminSalesChannelResponse>;
}
//# sourceMappingURL=sales-channel.d.ts.map