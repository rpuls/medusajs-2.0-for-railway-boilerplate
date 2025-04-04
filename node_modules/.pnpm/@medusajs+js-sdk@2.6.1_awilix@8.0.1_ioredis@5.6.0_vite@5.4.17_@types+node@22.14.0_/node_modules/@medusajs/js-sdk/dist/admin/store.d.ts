import { HttpTypes, SelectParams } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class Store {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    retrieve(id: string, query?: HttpTypes.AdminStoreParams, headers?: ClientHeaders): Promise<HttpTypes.AdminStoreResponse>;
    list(query?: HttpTypes.AdminStoreListParams, headers?: ClientHeaders): Promise<HttpTypes.AdminStoreListResponse>;
    update(id: string, body: HttpTypes.AdminUpdateStore, query?: SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminStoreResponse>;
}
//# sourceMappingURL=store.d.ts.map