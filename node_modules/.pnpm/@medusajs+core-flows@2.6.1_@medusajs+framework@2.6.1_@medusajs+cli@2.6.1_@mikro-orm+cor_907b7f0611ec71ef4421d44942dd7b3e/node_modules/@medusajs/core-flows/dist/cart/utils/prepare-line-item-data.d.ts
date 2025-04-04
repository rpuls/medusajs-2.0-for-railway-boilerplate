import { BigNumberInput, CreateOrderAdjustmentDTO, CreateOrderLineItemTaxLineDTO, InventoryItemDTO, LineItemAdjustmentDTO, LineItemTaxLineDTO, ProductVariantDTO } from "@medusajs/framework/types";
interface PrepareItemLineItemInput {
    title?: string;
    subtitle?: string;
    thumbnail?: string;
    quantity: BigNumberInput;
    product_id?: string;
    product_title?: string;
    product_description?: string;
    product_subtitle?: string;
    product_type?: string;
    product_type_id?: string;
    product_collection?: string;
    product_handle?: string;
    variant_id?: string;
    variant_sku?: string;
    variant_barcode?: string;
    variant_title?: string;
    variant_option_values?: Record<string, unknown>;
    requires_shipping?: boolean;
    is_discountable?: boolean;
    is_tax_inclusive?: boolean;
    raw_compare_at_unit_price?: BigNumberInput;
    compare_at_unit_price?: BigNumberInput;
    unit_price?: BigNumberInput;
    tax_lines?: LineItemTaxLineDTO[];
    adjustments?: LineItemAdjustmentDTO[];
    cart_id?: string;
    metadata?: Record<string, unknown> | null;
}
export interface PrepareVariantLineItemInput extends ProductVariantDTO {
    inventory_items: {
        inventory: InventoryItemDTO;
    }[];
    calculated_price: {
        calculated_price: {
            price_list_type: string;
        };
        is_calculated_price_tax_inclusive: boolean;
        original_amount: BigNumberInput;
        calculated_amount: BigNumberInput;
    };
}
export interface PrepareLineItemDataInput {
    item?: PrepareItemLineItemInput;
    isCustomPrice?: boolean;
    variant?: PrepareVariantLineItemInput;
    taxLines?: CreateOrderLineItemTaxLineDTO[];
    adjustments?: CreateOrderAdjustmentDTO[];
    cartId?: string;
    unitPrice?: BigNumberInput;
    isTaxInclusive: boolean;
}
export declare function prepareLineItemData(data: PrepareLineItemDataInput): any;
export declare function prepareTaxLinesData(data: CreateOrderLineItemTaxLineDTO[]): {
    description: string | undefined;
    tax_rate_id: string | undefined;
    code: string;
    rate: BigNumberInput;
    provider_id: string | undefined;
}[];
export declare function prepareAdjustmentsData(data: CreateOrderAdjustmentDTO[]): {
    code: string | undefined;
    amount: BigNumberInput;
    description: string | undefined;
    promotion_id: string | undefined;
    provider_id: string | undefined;
}[];
export {};
//# sourceMappingURL=prepare-line-item-data.d.ts.map