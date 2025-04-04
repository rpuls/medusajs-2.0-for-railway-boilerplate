import { UpdateCartWorkflowInputDTO } from "@medusajs/framework/types";
/**
 * The details of the carts to update.
 */
export type UpdateCartsStepInput = UpdateCartWorkflowInputDTO[];
export declare const updateCartsStepId = "update-carts";
/**
 * This step updates a cart.
 *
 * @example
 * const data = updateCartsStep([{
 *   id: "cart_123",
 *   email: "customer@gmail.com",
 * }])
 */
export declare const updateCartsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateCartsStepInput, import("@medusajs/framework/types").CartDTO[]>;
//# sourceMappingURL=update-carts.d.ts.map