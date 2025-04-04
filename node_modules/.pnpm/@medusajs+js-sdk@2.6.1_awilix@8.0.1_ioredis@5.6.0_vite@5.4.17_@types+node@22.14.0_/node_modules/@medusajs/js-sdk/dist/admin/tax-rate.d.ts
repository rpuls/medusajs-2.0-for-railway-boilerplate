import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class TaxRate {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    create(body: HttpTypes.AdminCreateTaxRate, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminTaxRateResponse>;
    update(id: string, body: HttpTypes.AdminUpdateTaxRate, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminTaxRateResponse>;
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminTaxRateDeleteResponse>;
    retrieve(id: string, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminTaxRateResponse>;
    list(query?: HttpTypes.AdminTaxRateListParams, headers?: ClientHeaders): Promise<HttpTypes.AdminTaxRateListResponse>;
}
//# sourceMappingURL=tax-rate.d.ts.map