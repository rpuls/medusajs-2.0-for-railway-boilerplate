import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class ShippingOption {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    create(body: HttpTypes.AdminCreateShippingOption, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminShippingOptionResponse>;
    retrieve(id: string, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminShippingOptionResponse>;
    update(id: string, body: HttpTypes.AdminUpdateShippingOption, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminShippingOptionResponse>;
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminShippingOptionDeleteResponse>;
    list(query?: HttpTypes.AdminShippingOptionListParams, headers?: ClientHeaders): Promise<HttpTypes.AdminShippingOptionListResponse>;
    updateRules(id: string, body: HttpTypes.AdminUpdateShippingOptionRules, headers?: ClientHeaders): Promise<HttpTypes.AdminUpdateShippingOptionRulesResponse>;
}
//# sourceMappingURL=shipping-option.d.ts.map