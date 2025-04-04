import { FilterableOrderProps, UpdateOrderDTO } from "@medusajs/framework/types";
/**
 * The details of updating the orders.
 */
export type UpdateOrdersStepInput = {
    /**
     * The filters to select the orders to update.
     */
    selector: FilterableOrderProps;
    /**
     * The data to update in the orders.
     */
    update: UpdateOrderDTO;
};
export declare const updateOrdersStepId = "update-orders";
/**
 * This step updates orders matching the specified filters.
 *
 * @example
 * const data = updateOrdersStep({
 *   selector: {
 *     id: "order_123"
 *   },
 *   update: {
 *     region_id: "region_123"
 *   }
 * })
 */
export declare const updateOrdersStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateOrdersStepInput, import("@medusajs/framework/types").OrderDTO[]>;
//# sourceMappingURL=update-orders.d.ts.map