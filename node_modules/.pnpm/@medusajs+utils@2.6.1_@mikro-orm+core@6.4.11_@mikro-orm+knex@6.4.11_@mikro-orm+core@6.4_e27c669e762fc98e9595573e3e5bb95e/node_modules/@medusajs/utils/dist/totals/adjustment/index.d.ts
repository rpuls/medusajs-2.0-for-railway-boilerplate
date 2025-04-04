import { AdjustmentLineDTO, BigNumberInput } from "@medusajs/types";
export declare function calculateAdjustmentTotal({ adjustments, includesTax, taxRate, }: {
    adjustments: Pick<AdjustmentLineDTO, "amount">[];
    includesTax?: boolean;
    taxRate?: BigNumberInput;
}): {
    adjustmentsTotal: import("bignumber.js").BigNumber;
    adjustmentsSubtotal: import("bignumber.js").BigNumber;
    adjustmentsTaxTotal: import("bignumber.js").BigNumber;
};
//# sourceMappingURL=index.d.ts.map