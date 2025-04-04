export interface UpdateTaxLineDTO {
    id: string;
    description?: string;
    tax_rate_id?: string;
    code?: string;
    rate?: number;
    provider_id?: string;
}
export interface CreateTaxLineDTO {
    description?: string;
    tax_rate_id?: string;
    code: string;
    rate: number;
    provider_id?: string;
}
//# sourceMappingURL=tax-line.d.ts.map