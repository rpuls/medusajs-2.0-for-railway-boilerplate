/**
 * The data to attach inventory items to variants.
 */
export type AttachInventoryItemToVariantsStepInput = {
    /**
     * The inventory item ID to attach to the variant.
     */
    inventoryItemId: string;
    /**
     * The variant ID to attach the inventory item to.
     */
    tag: string;
}[];
export declare const attachInventoryItemToVariantsStepId = "attach-inventory-items-to-variants-step";
/**
 * This step creates one or more links between variant and inventory item records.
 *
 * @example
 * const data = attachInventoryItemToVariants([
 *   {
 *     inventoryItemId: "iitem_123",
 *     tag: "variant_123"
 *   }
 * ])
 */
export declare const attachInventoryItemToVariants: import("@medusajs/framework/workflows-sdk").StepFunction<AttachInventoryItemToVariantsStepInput, unknown[]>;
//# sourceMappingURL=attach-inventory-items.d.ts.map