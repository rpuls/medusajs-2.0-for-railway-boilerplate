import { StoreDTO, StoreWorkflow } from "@medusajs/framework/types";
/**
 * The data to create stores.
 */
export type CreateStoresWorkflowInput = {
    /**
     * The stores to create.
     */
    stores: StoreWorkflow.CreateStoreWorkflowInput[];
};
/**
 * The created stores.
 */
export type CreateStoresWorkflowOutput = StoreDTO[];
export declare const createStoresWorkflowId = "create-stores";
/**
 * This workflow creates one or more stores. By default, Medusa uses a single store. This is useful
 * if you're building a multi-tenant application or a marketplace where each tenant has its own store.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create stores within your custom flows.
 *
 * @example
 * const { result } = await createStoresWorkflow(container)
 * .run({
 *   input: {
 *     stores: [
 *       {
 *         name: "Acme",
 *         supported_currencies: [{
 *           currency_code: "usd",
 *           is_default: true
 *         }]
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more stores.
 */
export declare const createStoresWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateStoresWorkflowInput, CreateStoresWorkflowOutput, []>;
//# sourceMappingURL=create-stores.d.ts.map