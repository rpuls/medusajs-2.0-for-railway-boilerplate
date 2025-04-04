import { RuleOperatorType } from "../../common";
import { PriceRule } from "../../pricing";
/**
 * The data to update a shipping option.
 */
type UpdateFlatShippingOptionInputBase = {
    /**
     * The ID of the shipping option.
     */
    id: string;
    /**
     * The name of the shipping option.
     */
    name?: string;
    /**
     * The ID of the service zone the shipping option belongs to.
     */
    service_zone_id?: string;
    /**
     * The ID of the shipping profile the shipping option belongs to.
     */
    shipping_profile_id?: string;
    /**
     * Custom data that's necessary for the shipping option's fulfillment provider.
     * Learn more about this property in [this documentation](https://docs.medusajs.com/resources/commerce-modules/fulfillment/shipping-option#data-property).
     */
    data?: Record<string, unknown>;
    /**
     * The ID of the shipping option's fulfillment provider.
     */
    provider_id?: string;
    /**
     * The type of the shipping option.
     */
    type?: {
        /**
         * The label of the shipping option type.
         */
        label: string;
        /**
         * The description of the shipping option type.
         */
        description: string;
        /**
         * The code of the shipping option type.
         */
        code: string;
    };
    /**
     * The rules that determine when the shipping option is available.
     */
    rules?: {
        /**
         * The attribute to compare.
         *
         * @example
         * customer_group
         */
        attribute: string;
        /**
         * The operator to compare with.
         *
         * @example
         * in
         */
        operator: RuleOperatorType;
        /**
         * The value to compare with.
         *
         * @example
         * cusgrp_123
         */
        value: string | string[];
    }[];
};
/**
 * The data to update a flat rate shipping option.
 */
export type UpdateShippingOptionPriceRecord = {
    /**
     * The ID of the price record.
     */
    id?: string;
    /**
     * The currency code of the price.
     *
     * @example
     * usd
     */
    currency_code?: string;
    /**
     * The amount of the price.
     */
    amount?: number;
    /**
     * The rules of the price.
     */
    rules?: PriceRule[];
} | {
    /**
     * The ID of the price record.
     */
    id?: string;
    /**
     * The ID of the region that this price applies in.
     */
    region_id?: string;
    /**
     * The amount of the price.
     */
    amount?: number;
    /**
     * The rules of the price.
     */
    rules?: PriceRule[];
};
export type UpdateCalculatedShippingOptionInput = UpdateFlatShippingOptionInputBase & {
    /**
     * The price type of the shipping option.
     */
    price_type?: "calculated";
};
/**
 * The data to update a flat rate shipping option.
 */
export type UpdateFlatRateShippingOptionInput = UpdateFlatShippingOptionInputBase & {
    /**
     * The price type of the shipping option.
     */
    price_type?: "flat";
    /**
     * The prices of the shipping option.
     */
    prices?: UpdateShippingOptionPriceRecord[];
};
/**
 * The data to update shipping options.
 */
export type UpdateShippingOptionsWorkflowInput = UpdateFlatRateShippingOptionInput | UpdateCalculatedShippingOptionInput;
/**
 * The result of updating shipping options.
 */
export type UpdateShippingOptionsWorkflowOutput = {
    /**
     * The updated shipping option's ID.
     */
    id: string;
}[];
export {};
//# sourceMappingURL=update-shipping-options.d.ts.map