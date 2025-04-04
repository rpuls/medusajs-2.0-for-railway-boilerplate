import { RemoteQueryFunction } from "@medusajs/types";
/**
 * The computed inventory availability for variants in a given sales channel.
 * The object's keys are the variant IDs.
 */
export type VariantAvailabilityResult = {
    [variant_id: string]: {
        /**
         * The available inventory quantity for the variant in the sales channel.
         */
        availability: number;
        /**
         * The ID of the sales channel for which the availability was computed.
         */
        sales_channel_id: string;
    };
};
/**
 * Computes the varaint availability for a list of variants in a given sales channel
 *
 * The availability algorithm works as follows:
 * 1. For each variant, we retrieve its inventory items.
 * 2. We calculate the available quantity for each inventory item, considering only the stock locations associated with the given sales channel.
 * 3. For each inventory item, we calculate the maximum deliverable quantity by dividing the available quantity by the quantity required for the variant.
 * 4. We take the minimum of these maximum deliverable quantities across all inventory items for the variant.
 * 5. This minimum value represents the overall availability of the variant in the given sales channel.
 *
 * The algorithm takes into account:
 * - Variant inventory items: The inventory records associated with each variant.
 * - Required quantities: The quantity of each inventory item required to fulfill one unit of the variant.
 * - Sales channels: The specific sales channel for which we're calculating availability.
 * - Stock locations: The inventory locations associated with the sales channel.
 *
 * @param query - The Query function
 * @param data - An object containing the variant ids and the sales channel id to compute the availability for
 * @returns an object containing the variant ids and their availability
 */
export declare function getVariantAvailability(query: Omit<RemoteQueryFunction, symbol>, data: VariantAvailabilityData): Promise<VariantAvailabilityResult>;
type TotalVariantAvailabilityData = {
    variant_ids: string[];
};
/**
 * Computes the total availability for a list of variants across all stock locations
 *
 * @param query - The Query function
 * @param data - An object containing the variant ids to compute the availability for
 * @returns the total availability for the given variants
 */
export declare function getTotalVariantAvailability(query: Omit<RemoteQueryFunction, symbol>, data: TotalVariantAvailabilityData): Promise<{
    [variant_id: string]: {
        availability: number;
    };
}>;
type VariantAvailabilityData = {
    variant_ids: string[];
    sales_channel_id: string;
};
export {};
//# sourceMappingURL=get-variant-availability.d.ts.map