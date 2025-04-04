import { FilterableStoreProps, UpdateStoreDTO } from "@medusajs/framework/types";
/**
 * The data to update in a store.
 */
export type UpdateStoresStepInput = {
    /**
     * The filters to select the stores to update.
     */
    selector: FilterableStoreProps;
    /**
     * The data to update in the stores.
     */
    update: UpdateStoreDTO;
};
export declare const updateStoresStepId = "update-stores";
/**
 * This step updates stores matching the specified filters.
 *
 * @example
 * const data = updateStoresStep({
 *   selector: {
 *     id: "store_123"
 *   },
 *   update: {
 *     name: "Acme"
 *   }
 * })
 */
export declare const updateStoresStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateStoresStepInput, import("@medusajs/framework/types").StoreDTO[]>;
//# sourceMappingURL=update-stores.d.ts.map