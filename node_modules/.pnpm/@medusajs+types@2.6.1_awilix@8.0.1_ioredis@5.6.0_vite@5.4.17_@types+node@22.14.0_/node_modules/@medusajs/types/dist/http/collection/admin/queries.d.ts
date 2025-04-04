import { OperatorMap } from "../../../dal";
import { BaseCollectionListParams, BaseCollectionParams } from "../common";
export interface AdminCollectionListParams extends BaseCollectionListParams {
    /**
     * Apply filters on the collection's deletion date.
     */
    deleted_at?: OperatorMap<string>;
}
export interface AdminCollectionParams extends BaseCollectionParams {
}
//# sourceMappingURL=queries.d.ts.map