import { MedusaContainer } from "@medusajs/framework/types";
import { AdminPriceListRemoteQueryDTO } from "../types";
export declare function listPriceLists({ container, remoteQueryFields, variables, }: {
    container: MedusaContainer;
    remoteQueryFields: string[];
    variables: Record<string, any>;
}): Promise<[AdminPriceListRemoteQueryDTO[], number]>;
//# sourceMappingURL=list-price-lists.d.ts.map