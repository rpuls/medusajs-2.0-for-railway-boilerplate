import { FilterablePricePreferenceProps } from "../../pricing";
/**
 * The data of a price preference to create.
 */
export interface CreatePricePreferencesWorkflowInput {
    /**
     * The attribute of the price preference. For example, `region_id` or `currency_code`.
     */
    attribute?: string;
    /**
     * The value of the price preference. For example, `reg_123` or `usd`.
     */
    value?: string;
    /**
     * Whether prices matching this preference are tax inclusive.
     *
     * Learn more in [this documentation](https://docs.medusajs.com/resources/commerce-modules/pricing/tax-inclusive-pricing).
     */
    is_tax_inclusive?: boolean;
}
interface UpdatePricePreferences {
    attribute?: string | null;
    value?: string | null;
    is_tax_inclusive?: boolean;
}
export interface UpdatePricePreferencesWorkflowInput {
    selector: FilterablePricePreferenceProps;
    update: UpdatePricePreferences;
}
export {};
//# sourceMappingURL=index.d.ts.map