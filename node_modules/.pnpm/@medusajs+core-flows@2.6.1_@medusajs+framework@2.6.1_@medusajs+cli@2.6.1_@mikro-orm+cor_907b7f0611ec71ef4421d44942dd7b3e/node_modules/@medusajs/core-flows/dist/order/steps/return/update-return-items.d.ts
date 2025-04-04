/**
 * The details of updating the return items.
 */
export type UpdateReturnItemBySelector = {
    /**
     * The ID of the return item to update.
     */
    id: string;
    /**
     * The data to update in the return item.
     */
    [key: string]: any;
}[];
export declare const updateReturnItemsStepId = "update-return-items";
/**
 * This step updates return items.
 *
 * @example
 * const data = updateReturnItemsStep([
 *   {
 *     id: "orli_123",
 *     quantity: 2
 *   }
 * ])
 */
export declare const updateReturnItemsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateReturnItemBySelector, any>;
//# sourceMappingURL=update-return-items.d.ts.map