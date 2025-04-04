import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "../types";
export declare function applyParamsAsFilters(mappings: {
    [param: string]: string;
}): (req: MedusaRequest, _: MedusaResponse, next: MedusaNextFunction) => Promise<void>;
//# sourceMappingURL=apply-params-as-filters.d.ts.map