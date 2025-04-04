import { BigNumberInput, TaxLineDTO } from "@medusajs/types";
export declare function calculateTaxTotal({ taxLines, taxableAmount, setTotalField, }: {
    taxLines: Pick<TaxLineDTO, "rate">[];
    taxableAmount: BigNumberInput;
    setTotalField?: string;
}): import("bignumber.js").BigNumber;
export declare function calculateAmountsWithTax({ taxLines, amount, includesTax, }: {
    taxLines: Pick<TaxLineDTO, "rate">[];
    amount: number;
    includesTax?: boolean;
}): {
    priceWithTax: number;
    priceWithoutTax: number;
};
//# sourceMappingURL=index.d.ts.map