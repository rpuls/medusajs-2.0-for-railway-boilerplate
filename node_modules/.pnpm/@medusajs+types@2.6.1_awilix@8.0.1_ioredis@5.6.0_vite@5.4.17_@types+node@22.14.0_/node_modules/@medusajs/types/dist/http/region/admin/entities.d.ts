import { BaseRegion, BaseRegionCountry } from "../common";
export interface AdminRegion extends Omit<BaseRegion, "countries"> {
    countries?: AdminRegionCountry[];
}
export interface AdminRegionCountry extends BaseRegionCountry {
}
//# sourceMappingURL=entities.d.ts.map