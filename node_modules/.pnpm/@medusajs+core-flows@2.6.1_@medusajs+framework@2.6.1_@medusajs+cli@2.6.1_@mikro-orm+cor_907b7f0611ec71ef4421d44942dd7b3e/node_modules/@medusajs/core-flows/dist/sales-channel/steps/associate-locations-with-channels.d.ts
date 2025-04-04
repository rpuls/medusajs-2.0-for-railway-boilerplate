/**
 * The data to associate locations with sales channels.
 */
export interface AssociateLocationsWithSalesChannelsStepInput {
    /**
     * The links to create between locations and sales channels.
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
export declare const associateLocationsWithSalesChannelsStepId = "associate-locations-with-sales-channels-step";
/**
 * This step creates links between stock locations and sales channel records.
 *
 * @example
 * const data = associateLocationsWithSalesChannelsStep({
 *   links: [
 *     {
 *       sales_channel_id: "sc_123",
 *       location_id: "sloc_123"
 *     }
 *   ]
 * })
 */
export declare const associateLocationsWithSalesChannelsStep: import("@medusajs/framework/workflows-sdk").StepFunction<AssociateLocationsWithSalesChannelsStepInput, unknown[]>;
//# sourceMappingURL=associate-locations-with-channels.d.ts.map