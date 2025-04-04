import { CreateSalesChannelDTO, SalesChannelDTO } from "@medusajs/framework/types";
/**
 * The data to create sales channels.
 */
export type CreateSalesChannelsWorkflowInput = {
    /**
     * The sales channels to create.
     */
    salesChannelsData: CreateSalesChannelDTO[];
};
/**
 * The created sales channels.
 */
export type CreateSalesChannelsWorkflowOutput = SalesChannelDTO[];
export declare const createSalesChannelsWorkflowId = "create-sales-channels";
/**
 * This workflow creates one or more sales channels. It's used by the
 * [Create Sales Channel Admin API Route](https://docs.medusajs.com/api/admin#sales-channels_postsaleschannels).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create sales channels within your custom flows.
 *
 * @example
 * const { result } = await createSalesChannelsWorkflow(container)
 * .run({
 *   input: {
 *     salesChannelsData: [
 *       {
 *         name: "Webshop"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create sales channels.
 */
export declare const createSalesChannelsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateSalesChannelsWorkflowInput, CreateSalesChannelsWorkflowOutput, []>;
//# sourceMappingURL=create-sales-channels.d.ts.map