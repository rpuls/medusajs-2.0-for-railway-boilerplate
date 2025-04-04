import { MedusaStoreRequest } from "@medusajs/framework/http";
import { HttpTypes, MedusaContainer, TaxCalculationContext } from "@medusajs/framework/types";
export type RequestWithContext<Body, QueryFields = Record<string, unknown>> = MedusaStoreRequest<Body, QueryFields> & {
    taxContext: {
        taxLineContext?: TaxCalculationContext;
        taxInclusivityContext?: {
            automaticTaxes: boolean;
        };
    };
};
export declare const refetchProduct: (idOrFilter: string | object, scope: MedusaContainer, fields: string[]) => Promise<any>;
export declare const wrapProductsWithTaxPrices: <T>(req: RequestWithContext<T>, products: HttpTypes.StoreProduct[]) => Promise<void>;
//# sourceMappingURL=helpers.d.ts.map