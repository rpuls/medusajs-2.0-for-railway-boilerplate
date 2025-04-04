import { CreateOrderDTO } from "@medusajs/framework/types";
/**
 * The orders to create.
 */
export type CreateOrdersStepInput = CreateOrderDTO[];
export declare const createOrdersStepId = "create-orders";
/**
 * This step creates one or more orders.
 *
 * @example
 * const data = createOrdersStep([{
 *   region_id: "region_123",
 *   customer_id: "customer_123",
 *   items: [
 *     {
 *       variant_id: "variant_123",
 *       quantity: 1,
 *       title: "Shirt",
 *       unit_price: 10,
 *     }
 *   ]
 * }])
 */
export declare const createOrdersStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateOrderDTO[], import("@medusajs/framework/types").OrderDTO[]>;
//# sourceMappingURL=create-orders.d.ts.map