import { MedusaContainer } from "@medusajs/framework/types";
import { AdminPriceListRemoteQueryDTO } from "../types";
export declare function getPriceList({ id, container, remoteQueryFields, apiFields, }: {
    id: string;
    container: MedusaContainer;
    remoteQueryFields: string[];
    apiFields: string[];
}): Promise<AdminPriceListRemoteQueryDTO>;
//# sourceMappingURL=get-price-list.d.ts.map