import { CreateTaxLineDTO, UpdateTaxLineDTO } from "./tax-line";
export interface CreateLineItemTaxLineDTO extends CreateTaxLineDTO {
    item_id: string;
}
export interface UpdateLineItemTaxLineDTO extends UpdateTaxLineDTO {
    item_id: string;
}
//# sourceMappingURL=line-item-tax-line.d.ts.map