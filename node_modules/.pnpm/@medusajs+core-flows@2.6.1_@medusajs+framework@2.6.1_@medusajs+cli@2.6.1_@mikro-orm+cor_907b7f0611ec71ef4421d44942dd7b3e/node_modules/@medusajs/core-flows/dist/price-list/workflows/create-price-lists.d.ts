import { CreatePriceListWorkflowInputDTO, PriceListDTO } from "@medusajs/framework/types";
/**
 * The data to create price lists.
 */
export type CreatePriceListsWorkflowInput = {
    /**
     * The price lists to create.
     */
    price_lists_data: CreatePriceListWorkflowInputDTO[];
};
/**
 * The created price lists.
 */
export type CreatePriceListsWorkflowOutput = PriceListDTO[];
export declare const createPriceListsWorkflowId = "create-price-lists";
/**
 * This workflow creates one or more price lists. It's used by the
 * [Create Price List Admin API Route](https://docs.medusajs.com/api/admin#price-lists_postpricelists).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create price lists in your custom flows.
 *
 * @example
 * const { result } = await createPriceListsWorkflow(container)
 * .run({
 *   input: {
 *     price_lists_data: [
 *       {
 *         title: "Price List 1",
 *         description: "Price List 1 Description",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more price lists.
 */
export declare const createPriceListsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreatePriceListsWorkflowInput, PriceListDTO[], []>;
//# sourceMappingURL=create-price-lists.d.ts.map