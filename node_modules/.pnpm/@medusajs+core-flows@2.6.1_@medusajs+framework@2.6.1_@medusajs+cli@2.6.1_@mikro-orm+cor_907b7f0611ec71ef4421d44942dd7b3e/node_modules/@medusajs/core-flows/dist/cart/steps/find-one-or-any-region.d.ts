/**
 * The details of the region to find.
 */
export type FindOneOrAnyRegionStepInput = {
    /**
     * The ID of the region to find.
     */
    regionId?: string;
};
export declare const findOneOrAnyRegionStepId = "find-one-or-any-region";
/**
 * This step retrieves a region either by the provided ID or the first region in the first store.
 */
export declare const findOneOrAnyRegionStep: import("@medusajs/framework/workflows-sdk").StepFunction<FindOneOrAnyRegionStepInput, import("@medusajs/framework/types").RegionDTO | null>;
//# sourceMappingURL=find-one-or-any-region.d.ts.map