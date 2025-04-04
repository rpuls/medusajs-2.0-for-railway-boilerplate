import { CreateStoreDTO } from "@medusajs/framework/types";
export declare const createStoresStepId = "create-stores";
/**
 * This step creates one or more stores.
 *
 * @example
 * const data = createStoresStep([{
 *   name: "Acme"
 * }])
 */
export declare const createStoresStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateStoreDTO[], import("@medusajs/framework/types").StoreDTO[]>;
//# sourceMappingURL=create-stores.d.ts.map