import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "../types";
export declare function applyDefaultFilters<TFilter extends object>(filtersToApply: TFilter): (req: MedusaRequest, _: MedusaResponse, next: MedusaNextFunction) => Promise<void>;
//# sourceMappingURL=apply-default-filters.d.ts.map