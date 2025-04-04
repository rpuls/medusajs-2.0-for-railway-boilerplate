import { FilterableRegionProps, RegionDTO, UpdateRegionDTO } from "../../region";
export interface UpdateRegionsWorkflowInput {
    selector: FilterableRegionProps;
    update: UpdateRegionDTO & {
        is_tax_inclusive?: boolean;
        payment_providers?: string[];
    };
}
export type UpdateRegionsWorkflowOutput = RegionDTO[];
//# sourceMappingURL=update-regions.d.ts.map