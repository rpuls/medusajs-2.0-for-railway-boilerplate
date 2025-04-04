import { CartLineItemDTO, CartWorkflowDTO, ProductVariantDTO, ShippingOptionDTO } from "@medusajs/types";
/**
 * The data to validate shipping data when cart is completed.
 */
export type ValidateShippingInput = {
    /**
     * The cart's details.
     */
    cart: Omit<CartWorkflowDTO, "items"> & {
        /**
         * The cart's line items.
         */
        items: (CartLineItemDTO & {
            /**
             * The item's variant.
             */
            variant: ProductVariantDTO;
        })[];
    };
    /**
     * The selected shipping options.
     */
    shippingOptions: ShippingOptionDTO[];
};
export declare const validateShippingStepId = "validate-shipping";
/**
 * This step validates shipping data when cart is completed.
 *
 * It ensures that a shipping method is selected if there is an item in the cart that requires shipping.
 * It also ensures that product's shipping profile mathes the selected shipping options. If the
 * conditions are not met, an error is thrown.
 *
 * :::note
 *
 * You can retrieve cart or shipping option's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * validateShippingStep({
 *   cart: {
 *     id: "cart_123",
 *     items: [
 *       {
 *         id: "item_123",
 *         variant: {
 *           id: "variant_123",
 *           // other item details...
 *         },
 *       }
 *     ],
 *     // other cart details...
 *   },
 *   shippingOptions: [
 *     {
 *       id: "option_123",
 *       shipping_profile_id: "sp_123",
 *       // other option details...
 *     }
 *   ]
 * })
 */
export declare const validateShippingStep: import("@medusajs/workflows-sdk").StepFunction<ValidateShippingInput, undefined>;
//# sourceMappingURL=validate-shipping.d.ts.map