import { CreateCartDTO } from "@medusajs/framework/types";
/**
 * The details of the carts to create.
 */
export type CreateCartsStepInput = CreateCartDTO[];
export declare const createCartsStepId = "create-carts";
/**
 * This step creates a cart.
 */
export declare const createCartsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateCartsStepInput, import("@medusajs/framework/types").CartDTO[]>;
//# sourceMappingURL=create-carts.d.ts.map