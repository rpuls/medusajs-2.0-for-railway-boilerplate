import { BaseFilterable } from "../../../dal";
import { FindParams, SelectParams } from "../../common";
export interface AdminPricePreferenceListParams extends FindParams, BaseFilterable<AdminPricePreferenceListParams> {
    /**
     * Filter by price preference ID(s).
     */
    id?: string | string[];
    /**
     * Filter by attribute(s).
     */
    attribute?: string | string[];
    /**
     * Filter by value(s).
     */
    value?: string | string[];
    /**
     * Query or keyword to filter the price preference's searchable fields.
     */
    q?: string;
}
export interface AdminPricePreferenceParams extends SelectParams {
}
//# sourceMappingURL=queries.d.ts.map