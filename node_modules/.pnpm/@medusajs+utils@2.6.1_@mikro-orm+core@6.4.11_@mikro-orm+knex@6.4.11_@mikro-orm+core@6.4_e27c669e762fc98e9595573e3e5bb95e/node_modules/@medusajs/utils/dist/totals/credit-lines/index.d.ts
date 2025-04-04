import { BigNumberInput } from "@medusajs/types";
export declare function calculateCreditLinesTotal({ creditLines, includesTax, taxRate, }: {
    creditLines: {
        amount: BigNumberInput;
    }[];
    includesTax?: boolean;
    taxRate?: BigNumberInput;
}): {
    creditLinesTotal: import("bignumber.js").BigNumber;
    creditLinesSubtotal: import("bignumber.js").BigNumber;
    creditLinesTaxTotal: import("bignumber.js").BigNumber;
};
//# sourceMappingURL=index.d.ts.map