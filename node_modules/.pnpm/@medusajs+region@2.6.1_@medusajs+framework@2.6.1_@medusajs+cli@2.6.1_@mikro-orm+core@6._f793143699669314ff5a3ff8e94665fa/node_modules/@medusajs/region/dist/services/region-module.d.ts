import { Context, CreateRegionDTO, DAL, FilterableRegionProps, InferEntityType, InternalModuleDeclaration, IRegionModuleService, ModulesSdkTypes, RegionCountryDTO, RegionDTO, SoftDeleteReturn, UpdateRegionDTO, UpsertRegionDTO } from "@medusajs/framework/types";
import { Country, Region } from "../models";
import { UpdateRegionInput } from "../types";
type InjectedDependencies = {
    baseRepository: DAL.RepositoryService;
    regionService: ModulesSdkTypes.IMedusaInternalService<any>;
    countryService: ModulesSdkTypes.IMedusaInternalService<any>;
};
declare const RegionModuleService_base: import("@medusajs/framework/utils").MedusaServiceReturnType<{
    Region: {
        dto: RegionDTO;
        model: typeof Region;
    };
    Country: {
        dto: RegionCountryDTO;
        model: typeof Country;
    };
}>;
export default class RegionModuleService extends RegionModuleService_base implements IRegionModuleService {
    protected readonly moduleDeclaration: InternalModuleDeclaration;
    protected baseRepository_: DAL.RepositoryService;
    protected readonly regionService_: ModulesSdkTypes.IMedusaInternalService<typeof Region>;
    protected readonly countryService_: ModulesSdkTypes.IMedusaInternalService<typeof Country>;
    constructor({ baseRepository, regionService, countryService }: InjectedDependencies, moduleDeclaration: InternalModuleDeclaration);
    createRegions(data: CreateRegionDTO[], sharedContext?: Context): Promise<RegionDTO[]>;
    createRegions(data: CreateRegionDTO, sharedContext?: Context): Promise<RegionDTO>;
    createRegions_(data: CreateRegionDTO[], sharedContext?: Context): Promise<InferEntityType<typeof Region>[]>;
    softDeleteRegions(ids: string | object | string[] | object[], config?: SoftDeleteReturn<string>, sharedContext?: Context): Promise<Record<string, string[]> | void>;
    upsertRegions(data: UpsertRegionDTO[], sharedContext?: Context): Promise<RegionDTO[]>;
    upsertRegions(data: UpsertRegionDTO, sharedContext?: Context): Promise<RegionDTO>;
    updateRegions(id: string, data: UpdateRegionDTO, sharedContext?: Context): Promise<RegionDTO>;
    updateRegions(selector: FilterableRegionProps, data: UpdateRegionDTO, sharedContext?: Context): Promise<RegionDTO[]>;
    protected updateRegions_(data: UpdateRegionInput[], sharedContext?: Context): Promise<InferEntityType<typeof Region>[]>;
    private static normalizeInput;
    /**
     * Validate that countries can be assigned to a region.
     *
     * NOTE: this method relies on countries of the regions that we are assigning to need to be unassigned first.
     * @param countries
     * @param sharedContext
     * @private
     */
    private validateCountries;
}
export {};
//# sourceMappingURL=region-module.d.ts.map