/**
 * The data to detach stock locations from sales channels.
 */
export interface DetachLocationsFromSalesChannelsStepInput {
    /**
     * The links to dismiss between locations and sales channels.
     */
    links: {
        /**
         * The ID of the sales channel.
         */
        sales_channel_id: string;
        /**
         * The ID of the location.
         */
        location_id: string;
    }[];
}
export declare const detachLocationsFromSalesChannelsStepId = "detach-locations-from-sales-channels";
/**
 * This step dismisses links between stock location and sales channel records.
 *
 * @example
 * const data = detachLocationsFromSalesChannelsStep({
 *   links: [
 *     {
 *       sales_channel_id: "sc_123",
 *       location_id: "sloc_123"
 *     }
 *   ]
 * })
 */
export declare const detachLocationsFromSalesChannelsStep: import("@medusajs/framework/workflows-sdk").StepFunction<DetachLocationsFromSalesChannelsStepInput, never[] | undefined>;
//# sourceMappingURL=detach-locations-from-channels.d.ts.map