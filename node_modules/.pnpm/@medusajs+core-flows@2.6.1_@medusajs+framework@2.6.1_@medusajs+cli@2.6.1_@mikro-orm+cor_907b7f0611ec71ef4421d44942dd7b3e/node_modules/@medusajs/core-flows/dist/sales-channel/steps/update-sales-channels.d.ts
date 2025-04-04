import { FilterableSalesChannelProps, UpdateSalesChannelDTO } from "@medusajs/framework/types";
/**
 * The data to update sales channels.
 */
export type UpdateSalesChannelsStepInput = {
    /**
     * The filters to select the sales channels to update.
     */
    selector: FilterableSalesChannelProps;
    /**
     * The data to update the sales channels.
     */
    update: UpdateSalesChannelDTO;
};
export declare const updateSalesChannelsStepId = "update-sales-channels";
/**
 * This step updates sales channels matching the specified filters.
 *
 * @example
 * const data = updateSalesChannelsStep({
 *   selector: {
 *     id: "sc_123"
 *   },
 *   update: {
 *     name: "Webshop"
 *   }
 * })
 */
export declare const updateSalesChannelsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateSalesChannelsStepInput, import("@medusajs/framework/types").SalesChannelDTO[]>;
//# sourceMappingURL=update-sales-channels.d.ts.map