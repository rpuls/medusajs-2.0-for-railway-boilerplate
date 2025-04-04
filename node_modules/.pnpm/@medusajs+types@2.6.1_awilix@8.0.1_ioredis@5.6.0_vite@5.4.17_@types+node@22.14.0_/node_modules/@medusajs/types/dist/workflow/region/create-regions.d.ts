import { CreateRegionDTO, RegionDTO } from "../../region";
/**
 * The data to create regions.
 */
export interface CreateRegionsWorkflowInput {
    /**
     * The regions to create.
     */
    regions: (CreateRegionDTO & {
        /**
         * The IDs of payment providers that are available in the region.
         */
        payment_providers?: string[];
        /**
         * Whether prices in the region are tax inclusive.
         *
         * Learn more in [this documentation](https://docs.medusajs.com/resources/commerce-modules/pricing/tax-inclusive-pricing).
         */
        is_tax_inclusive?: boolean;
    })[];
}
/**
 * The created regions.
 */
export type CreateRegionsWorkflowOutput = RegionDTO[];
//# sourceMappingURL=create-regions.d.ts.map