import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class TaxRegion {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    create(body: HttpTypes.AdminCreateTaxRegion, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminTaxRegionResponse>;
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminTaxRegionDeleteResponse>;
    retrieve(id: string, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminTaxRegionResponse>;
    list(query?: HttpTypes.AdminTaxRegionListParams, headers?: ClientHeaders): Promise<HttpTypes.AdminTaxRegionListResponse>;
}
//# sourceMappingURL=tax-region.d.ts.map