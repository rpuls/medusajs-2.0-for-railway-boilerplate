import { BigNumberInput, ConfirmVariantInventoryWorkflowInputDTO } from "@medusajs/framework/types";
interface ConfirmInventoryItem {
    id?: string;
    inventory_item_id: string;
    required_quantity: number;
    allow_backorder: boolean;
    quantity: BigNumberInput;
    location_ids: string[];
}
export declare const prepareConfirmInventoryInput: (data: {
    input: ConfirmVariantInventoryWorkflowInputDTO;
}) => {
    items: ConfirmInventoryItem[];
};
export {};
//# sourceMappingURL=prepare-confirm-inventory-input.d.ts.map