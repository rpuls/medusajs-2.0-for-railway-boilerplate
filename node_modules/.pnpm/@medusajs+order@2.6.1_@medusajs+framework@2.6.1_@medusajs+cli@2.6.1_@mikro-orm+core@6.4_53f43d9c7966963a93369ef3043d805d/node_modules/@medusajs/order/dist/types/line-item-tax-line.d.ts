import { CreateOrderTaxLineDTO, UpdateOrderTaxLineDTO } from "./tax-line";
export interface CreateOrderLineItemTaxLineDTO extends CreateOrderTaxLineDTO {
    item_id: string;
}
export interface UpdateOrderLineItemTaxLineDTO extends UpdateOrderTaxLineDTO {
    item_id: string;
}
//# sourceMappingURL=line-item-tax-line.d.ts.map