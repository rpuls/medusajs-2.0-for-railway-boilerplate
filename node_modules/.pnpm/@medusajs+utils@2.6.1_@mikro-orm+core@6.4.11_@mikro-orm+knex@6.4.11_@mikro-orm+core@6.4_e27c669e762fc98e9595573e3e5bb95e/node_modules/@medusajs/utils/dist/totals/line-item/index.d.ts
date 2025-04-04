import { AdjustmentLineDTO, TaxLineDTO } from "@medusajs/types";
import { BigNumber } from "../big-number";
interface GetLineItemsTotalsContext {
    includeTax?: boolean;
    extraQuantityFields?: Record<string, string>;
}
export interface GetItemTotalInput {
    id: string;
    unit_price: BigNumber;
    quantity: BigNumber;
    is_tax_inclusive?: boolean;
    tax_lines?: Pick<TaxLineDTO, "rate">[];
    adjustments?: Pick<AdjustmentLineDTO, "amount">[];
    detail?: {
        fulfilled_quantity: BigNumber;
        delivered_quantity: BigNumber;
        shipped_quantity: BigNumber;
        return_requested_quantity: BigNumber;
        return_received_quantity: BigNumber;
        return_dismissed_quantity: BigNumber;
        written_off_quantity: BigNumber;
    };
}
export interface GetItemTotalOutput {
    quantity: BigNumber;
    unit_price: BigNumber;
    subtotal: BigNumber;
    total: BigNumber;
    original_total: BigNumber;
    discount_total: BigNumber;
    discount_subtotal: BigNumber;
    discount_tax_total: BigNumber;
    refundable_total?: BigNumber;
    refundable_total_per_unit?: BigNumber;
    tax_total: BigNumber;
    original_tax_total: BigNumber;
    fulfilled_total?: BigNumber;
    shipped_total?: BigNumber;
    return_requested_total?: BigNumber;
    return_received_total?: BigNumber;
    return_dismissed_total?: BigNumber;
    write_off_total?: BigNumber;
}
export declare function getLineItemsTotals(items: GetItemTotalInput[], context: GetLineItemsTotalsContext): {};
export {};
//# sourceMappingURL=index.d.ts.map