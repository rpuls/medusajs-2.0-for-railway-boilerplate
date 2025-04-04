import { BigNumberInput } from "@medusajs/types";
/**
 * The details of the items and their quantity to reserve.
 */
export interface ReserveVariantInventoryStepInput {
    items: {
        /**
         * The ID for the line item.
         */
        id?: string;
        /**
         * The ID of the inventory item to reserve quantities from.
         */
        inventory_item_id: string;
        /**
         * The number of units a single quantity is equivalent to. For example, if a customer orders one quantity of the variant, Medusa checks the availability of the quantity multiplied by the
         * value set for `required_quantity`. When the customer orders the quantity, Medusa reserves the ordered quantity multiplied by the value set for `required_quantity`.
         */
        required_quantity: number;
        /**
         * Whether the variant can be ordered even if it's out of stock.
         */
        allow_backorder: boolean;
        /**
         * The quantity to reserve.
         */
        quantity: BigNumberInput;
        /**
         * The IDs of stock locations to reserve the item's quantity in.
         */
        location_ids: string[];
    }[];
}
export declare const reserveInventoryStepId = "reserve-inventory-step";
/**
 * This step reserves the quantity of line items from the associated
 * variant's inventory.
 *
 * @example
 * const data = reserveInventoryStep({
 *   "items": [{
 *     "inventory_item_id": "iitem_123",
 *     "required_quantity": 1,
 *     "allow_backorder": false,
 *     "quantity": 1,
 *     "location_ids": [
 *       "sloc_123"
 *     ]
 *   }]
 * })
 */
export declare const reserveInventoryStep: import("@medusajs/framework/workflows-sdk").StepFunction<ReserveVariantInventoryStepInput, import("@medusajs/types").ReservationItemDTO[]>;
//# sourceMappingURL=reserve-inventory.d.ts.map