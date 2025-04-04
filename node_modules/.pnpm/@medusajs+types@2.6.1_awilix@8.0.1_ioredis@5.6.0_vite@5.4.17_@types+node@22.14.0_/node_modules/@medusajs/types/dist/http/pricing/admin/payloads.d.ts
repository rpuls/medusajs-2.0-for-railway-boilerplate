export interface AdminCreatePricePreference {
    /**
     * The attribute that the price preference refers to.
     *
     * Current supported values: `region_id` and `currency_code`.
     */
    attribute?: string;
    /**
     * The attribute's value. For example, if the `attribute` is `region_id`,
     * the value is a region's ID. Prices in that region use this price
     * preference.
     */
    value?: string;
    /**
     * Whether prices matching this price preference have
     * taxes included in their amount.
     */
    is_tax_inclusive?: boolean;
}
export interface AdminUpdatePricePreference {
    /**
     * The attribute that the price preference refers to.
     *
     * Current supported values: `region_id` and `currency_code`.
     */
    attribute?: string | null;
    /**
     * The attribute's value. For example, if the `attribute` is `region_id`,
     * the value is a region's ID. Prices in that region use this price
     * preference.
     */
    value?: string | null;
    /**
     * Whether prices matching this price preference have
     * taxes included in their amount.
     */
    is_tax_inclusive?: boolean;
}
//# sourceMappingURL=payloads.d.ts.map