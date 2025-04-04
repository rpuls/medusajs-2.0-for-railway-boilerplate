import { CreateSalesChannelDTO } from "@medusajs/framework/types";
/**
 * The data to create a default sales channel.
 */
export interface CreateDefaultSalesChannelStepInput {
    /**
     * The default sales channel data.
     */
    data: CreateSalesChannelDTO;
}
export declare const createDefaultSalesChannelStepId = "create-default-sales-channel";
/**
 * This step creates a default sales channel if none exist in the application.
 * This is useful when creating seed scripts.
 *
 * @example
 * const data = createDefaultSalesChannelStep({
 *   data: {
 *     name: "Webshop",
 *   }
 * })
 */
export declare const createDefaultSalesChannelStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateDefaultSalesChannelStepInput, import("@medusajs/framework/types").SalesChannelDTO | undefined>;
//# sourceMappingURL=create-default-sales-channel.d.ts.map