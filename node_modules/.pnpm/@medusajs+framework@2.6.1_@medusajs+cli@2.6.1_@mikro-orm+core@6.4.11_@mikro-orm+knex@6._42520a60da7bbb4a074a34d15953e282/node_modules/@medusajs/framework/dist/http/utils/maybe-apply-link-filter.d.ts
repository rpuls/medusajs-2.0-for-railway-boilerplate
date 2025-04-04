import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "../types";
export declare function maybeApplyLinkFilter({ entryPoint, resourceId, filterableField, filterByField, }: {
    entryPoint: any;
    resourceId: any;
    filterableField: any;
    filterByField?: string | undefined;
}): (req: MedusaRequest, _: MedusaResponse, next: MedusaNextFunction) => Promise<void>;
//# sourceMappingURL=maybe-apply-link-filter.d.ts.map