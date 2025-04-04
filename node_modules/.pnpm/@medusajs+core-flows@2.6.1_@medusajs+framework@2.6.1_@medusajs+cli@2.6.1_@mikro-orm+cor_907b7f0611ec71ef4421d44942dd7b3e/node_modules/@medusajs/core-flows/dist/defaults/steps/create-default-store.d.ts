import { CreateStoreDTO, StoreDTO } from "@medusajs/framework/types";
/**
 * The data to create a default store.
 */
type CreateDefaultStoreStepInput = {
    /**
     * The store to create.
     */
    store: CreateStoreDTO;
};
export declare const createDefaultStoreStepId = "create-default-store";
/**
 * This step creates a default store. Useful if creating a workflow
 * that seeds data into Medusa.
 *
 * @example
 * const data = createDefaultStoreStep({
 *   store: {
 *     name: "Acme",
 *     supported_currencies: [
 *       {
 *         currency_code: "usd",
 *         is_default: true
 *       }
 *     ],
 *   }
 * })
 */
export declare const createDefaultStoreStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateDefaultStoreStepInput, StoreDTO | undefined>;
export {};
//# sourceMappingURL=create-default-store.d.ts.map