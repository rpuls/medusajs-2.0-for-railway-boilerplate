import { CreateSalesChannelDTO } from "@medusajs/framework/types";
/**
 * The data to create sales channels.
 */
export interface CreateSalesChannelsStepInput {
    /**
     * The sales channels to create.
     */
    data: CreateSalesChannelDTO[];
}
export declare const createSalesChannelsStepId = "create-sales-channels";
/**
 * This step creates one or more sales channels.
 *
 * @example
 * const data = createSalesChannelsStep({
 *   data: [{
 *     name: "Webshop",
 *   }]
 * })
 */
export declare const createSalesChannelsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateSalesChannelsStepInput, import("@medusajs/framework/types").SalesChannelDTO[]>;
//# sourceMappingURL=create-sales-channels.d.ts.map