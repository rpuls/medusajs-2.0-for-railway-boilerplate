import { BigNumberInput } from "../../totals/big-number";
export interface CreateInventoryLevelInput {
    /**
     * The ID of the associated inventory item.
     */
    inventory_item_id: string;
    /**
     * The ID of the associated location.
     */
    location_id: string;
    /**
     * The stocked quantity of the associated inventory item in the associated location.
     */
    stocked_quantity?: number;
    /**
     * The incoming quantity of the associated inventory item in the associated location.
     */
    incoming_quantity?: number;
}
/**
 * @interface
 *
 * The attributes to update in an inventory level.
 */
export interface UpdateInventoryLevelInput {
    /**
     * ID of the inventory level to update
     */
    id?: string;
    /**
     * The ID of the associated inventory item.
     */
    inventory_item_id: string;
    /**
     * The ID of the associated location.
     */
    location_id: string;
    /**
     * The stocked quantity of the associated inventory item in the associated location.
     */
    stocked_quantity?: number;
    /**
     * The incoming quantity of the associated inventory item in the associated location.
     */
    incoming_quantity?: number;
}
export type BulkAdjustInventoryLevelInput = {
    /**
     * The ID of the associated inventory level.
     */
    inventory_item_id: string;
    /**
     * The ID of the associated location.
     */
    location_id: string;
    /**
     * The quantity to adjust the inventory level by.
     * If positive, the quantity will be added to the stocked quantity.
     * If negative, the quantity will be subtracted from the stocked quantity.
     */
    adjustment: BigNumberInput;
};
//# sourceMappingURL=inventory-level.d.ts.map