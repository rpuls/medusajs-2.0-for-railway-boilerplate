import { BigNumberInput, CartLikeWithTotals } from "@medusajs/types";
interface TotalsConfig {
    includeTaxes?: boolean;
}
export interface DecorateCartLikeInputDTO {
    credit_lines?: {
        amount: BigNumberInput;
    }[];
    items?: {
        id?: string;
        unit_price: BigNumberInput;
        is_tax_inclusive?: boolean;
        quantity: BigNumberInput;
        adjustments?: {
            amount: BigNumberInput;
        }[];
        tax_lines?: {
            rate: BigNumberInput;
        }[];
    }[];
    shipping_methods?: {
        id?: string;
        amount: BigNumberInput;
        is_tax_inclusive?: boolean;
        adjustments?: {
            amount: BigNumberInput;
        }[];
        tax_lines?: {
            rate: BigNumberInput;
        }[];
    }[];
    region?: {
        automatic_taxes?: boolean;
    };
}
export declare function decorateCartTotals(cartLike: DecorateCartLikeInputDTO, config?: TotalsConfig): CartLikeWithTotals;
export {};
//# sourceMappingURL=index.d.ts.map