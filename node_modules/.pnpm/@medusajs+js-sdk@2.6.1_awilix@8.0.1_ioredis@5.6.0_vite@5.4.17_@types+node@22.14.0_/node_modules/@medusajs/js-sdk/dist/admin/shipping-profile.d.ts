import { HttpTypes } from "@medusajs/types";
import { Client } from "../client";
import { ClientHeaders } from "../types";
export declare class ShippingProfile {
    /**
     * @ignore
     */
    private client;
    /**
     * @ignore
     */
    constructor(client: Client);
    create(body: HttpTypes.AdminCreateShippingProfile, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminShippingProfileResponse>;
    update(id: string, body: HttpTypes.AdminUpdateShippingProfile, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminShippingProfileResponse>;
    delete(id: string, headers?: ClientHeaders): Promise<HttpTypes.AdminShippingProfileDeleteResponse>;
    list(query?: HttpTypes.AdminShippingProfileListParams, headers?: ClientHeaders): Promise<HttpTypes.AdminShippingProfileListResponse>;
    retrieve(id: string, query?: HttpTypes.SelectParams, headers?: ClientHeaders): Promise<HttpTypes.AdminShippingProfileResponse>;
}
//# sourceMappingURL=shipping-profile.d.ts.map