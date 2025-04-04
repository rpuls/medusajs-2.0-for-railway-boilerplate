import { BigNumberInput } from "@medusajs/framework/types";
/**
 * The details of the cart items to confirm their inventory availability.
 */
export interface ConfirmVariantInventoryStepInput {
    /**
     * The items to confirm inventory for.
     */
    items: {
        /**
         * The ID of the inventory item associated with the line item's variant.
         */
        inventory_item_id: string;
        /**
         * The number of units a single quantity is equivalent to. For example, if a customer orders one quantity of the variant, Medusa checks the availability of the quantity multiplied by the
         * value set for `required_quantity`. When the customer orders the quantity, Medusa reserves the ordered quantity multiplied by the value set for `required_quantity`.
         */
        required_quantity: number;
        /**
         * Whether the variant can be ordered even if it's out of stock. If a variant has this enabled, the step doesn't throw an error.
         */
        allow_backorder: boolean;
        /**
         * The quantity in the cart.
         */
        quantity: BigNumberInput;
        /**
         * The ID of the stock locations that the inventory quantity is available in.
         */
        location_ids: string[];
    }[];
}
export declare const confirmInventoryStepId = "confirm-inventory-step";
/**
 * This step validates that items in the cart have sufficient inventory quantity.
 * If an item doesn't have sufficient inventory, an error is thrown.
 *
 * @example
 * confirmInventoryStep({
 *   items: [
 *     {
 *       inventory_item_id: "iitem_123",
 *       required_quantity: 1,
 *       allow_backorder: false,
 *       quantity: 1,
 *       location_ids: ["sloc_123"]
 *     }
 *   ]
 * })
 */
export declare const confirmInventoryStep: import("@medusajs/framework/workflows-sdk").StepFunction<ConfirmVariantInventoryStepInput, never[] | null>;
//# sourceMappingURL=confirm-inventory.d.ts.map