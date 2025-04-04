/**
 * The data to associate fulfillment sets with locations.
 */
export interface AssociateFulfillmentSetsWithLocationStepInput {
    /**
     * The data to associate fulfillment sets with locations.
     */
    input: {
        /**
         * The ID of the location to associate the fulfillment sets with.
         */
        location_id: string;
        /**
         * The IDs of the fulfillment sets to associate with the location.
         */
        fulfillment_set_ids: string[];
    }[];
}
export declare const associateFulfillmentSetsWithLocationStepId = "associate-fulfillment-sets-with-location-step";
/**
 * This step creates links between location and fulfillment set records.
 */
export declare const associateFulfillmentSetsWithLocationStep: import("@medusajs/framework/workflows-sdk").StepFunction<AssociateFulfillmentSetsWithLocationStepInput, unknown[]>;
//# sourceMappingURL=associate-locations-with-fulfillment-sets.d.ts.map