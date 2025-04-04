/**
 * The data to add a fulfillment set to a stock location.
 */
export interface CreateLocationFulfillmentSetWorkflowInputDTO {
    /**
     * The ID of the stock location to add the fulfillment set to.
     */
    location_id: string;
    /**
     * The data of the fulfillment set to add.
     */
    fulfillment_set_data: {
        /**
         * The name of the fulfillment set.
         */
        name: string;
        /**
         * The type of the fulfillment set.
         */
        type: string;
    };
}
//# sourceMappingURL=mutations.d.ts.map