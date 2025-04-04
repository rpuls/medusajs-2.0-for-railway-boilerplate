import { FindParams, HttpTypes, SelectParams } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class Region {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    create(body: HttpTypes.AdminCreateRegion, query?: SelectParams, headers?: ClientHeaders): Promise<{
        region: HttpTypes.AdminRegion;
    }>;
    update(id: string, body: HttpTypes.AdminUpdateRegion, query?: SelectParams, headers?: ClientHeaders): Promise<{
        region: HttpTypes.AdminRegion;
    }>;
    list(queryParams?: FindParams & HttpTypes.AdminRegionFilters, headers?: ClientHeaders): Promise<HttpTypes.PaginatedResponse<{
        regions: HttpTypes.AdminRegion[];
    }>>;
    retrieve(id: string, query?: SelectParams, headers?: ClientHeaders): Promise<{
        region: HttpTypes.AdminRegion;
    }>;
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminRegionDeleteResponse>;
}
//# sourceMappingURL=region.d.ts.map