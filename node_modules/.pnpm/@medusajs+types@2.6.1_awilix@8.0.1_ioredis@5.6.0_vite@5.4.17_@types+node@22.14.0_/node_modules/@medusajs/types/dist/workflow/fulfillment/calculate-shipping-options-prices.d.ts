import { CalculatedShippingOptionPrice } from "../../fulfillment";
/**
 * The data to calculate shipping option prices.
 */
export type CalculateShippingOptionsPricesWorkflowInput = {
    /**
     * The ID of the cart to calculate the shipping options for.
     */
    cart_id: string;
    /**
     * The shipping options to calculate the prices for.
     */
    shipping_options: {
        /**
         * The ID of the shipping option.
         */
        id: string;
        /**
         * Custom data that's necessary for the shipping option's fulfillment provider
         * to calculate the price.
         *
         * Learn more about this property in [this documentation](https://docs.medusajs.com/resources/commerce-modules/fulfillment/shipping-option#data-property).
         */
        data?: Record<string, unknown>;
    }[];
};
/**
 * The calculated shipping option prices.
 */
export type CalculateShippingOptionsPricesWorkflowOutput = CalculatedShippingOptionPrice[];
//# sourceMappingURL=calculate-shipping-options-prices.d.ts.map