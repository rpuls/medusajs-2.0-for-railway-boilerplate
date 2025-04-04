"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshCartShippingMethodsWorkflow = exports.refreshCartShippingMethodsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const steps_1 = require("../steps");
const update_shipping_methods_1 = require("../steps/update-shipping-methods");
const list_shipping_options_for_cart_with_pricing_1 = require("./list-shipping-options-for-cart-with-pricing");
exports.refreshCartShippingMethodsWorkflowId = "refresh-cart-shipping-methods";
/**
 * This workflow refreshes a cart's shipping methods, ensuring that their associated shipping options can still be used on the cart,
 * and retrieve their correct pricing after a cart update. This workflow is used by the {@link refreshCartItemsWorkflow}.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to refresh the cart's shipping method after making updates to the cart.
 *
 * @example
 * const { result } = await refreshCartShippingMethodsWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *   }
 * })
 *
 * @summary
 *
 * Refresh a cart's shipping methods after an update.
 *
 * @property hooks.validate - This hook is executed before all operations. You can consume this hook to perform any custom validation. If validation fails, you can throw an error to stop the workflow execution.
 */
exports.refreshCartShippingMethodsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.refreshCartShippingMethodsWorkflowId, (input) => {
    const fetchCart = (0, workflows_sdk_1.when)({ input }, ({ input }) => {
        return !input.cart;
    }).then(() => {
        return (0, common_1.useRemoteQueryStep)({
            entry_point: "cart",
            fields: [
                "id",
                "sales_channel_id",
                "currency_code",
                "region_id",
                "shipping_methods.*",
                "shipping_address.city",
                "shipping_address.country_code",
                "shipping_address.province",
                "shipping_methods.shipping_option_id",
                "shipping_methods.data",
                "total",
            ],
            variables: { id: input.cart_id },
            throw_if_key_not_found: true,
            list: false,
        }).config({ name: "get-cart" });
    });
    const cart = (0, workflows_sdk_1.transform)({ fetchCart, input }, ({ fetchCart, input }) => {
        return input.cart ?? fetchCart;
    });
    const listShippingOptionsInput = (0, workflows_sdk_1.transform)({ cart }, ({ cart }) => (cart.shipping_methods || [])
        .map((shippingMethod) => ({
        id: shippingMethod.shipping_option_id,
        data: shippingMethod.data,
    }))
        .filter(Boolean));
    const validate = (0, workflows_sdk_1.createHook)("validate", {
        input,
        cart,
    });
    (0, workflows_sdk_1.when)({ listShippingOptionsInput }, ({ listShippingOptionsInput }) => {
        return !!listShippingOptionsInput?.length;
    }).then(() => {
        const shippingOptions = list_shipping_options_for_cart_with_pricing_1.listShippingOptionsForCartWithPricingWorkflow.runAsStep({
            input: {
                options: listShippingOptionsInput,
                cart_id: cart.id,
                is_return: false,
            },
        });
        // Creates an object on which shipping methods to remove or update depending
        // on the validity of the shipping options for the cart
        const shippingMethodsData = (0, workflows_sdk_1.transform)({ cart, shippingOptions }, ({ cart, shippingOptions }) => {
            const { shipping_methods: shippingMethods = [] } = cart;
            const validShippingMethods = shippingMethods.filter((shippingMethod) => {
                // Fetch  the available shipping options for the cart context and find the one associated
                // with the current shipping method
                const shippingOption = shippingOptions.find((shippingOption) => shippingOption.id === shippingMethod.shipping_option_id);
                const shippingOptionPrice = shippingOption?.calculated_price?.calculated_amount;
                // The shipping method is only valid if both the shipping option and the price is found
                // for the context of the cart. The invalid options will lead to a deleted shipping method
                if ((0, utils_1.isPresent)(shippingOption) && (0, utils_1.isDefined)(shippingOptionPrice)) {
                    return true;
                }
                return false;
            });
            const shippingMethodIds = shippingMethods.map((sm) => sm.id);
            const validShippingMethodIds = validShippingMethods.map((sm) => sm.id);
            const invalidShippingMethodIds = shippingMethodIds.filter((id) => !validShippingMethodIds.includes(id));
            const shippingMethodsToUpdate = validShippingMethods.map((shippingMethod) => {
                const shippingOption = shippingOptions.find((s) => s.id === shippingMethod.shipping_option_id);
                return {
                    id: shippingMethod.id,
                    shipping_option_id: shippingOption.id,
                    amount: shippingOption.calculated_price.calculated_amount,
                    is_tax_inclusive: shippingOption.calculated_price
                        .is_calculated_price_tax_inclusive,
                };
            });
            return {
                shippingMethodsToRemove: invalidShippingMethodIds,
                shippingMethodsToUpdate,
            };
        });
        (0, workflows_sdk_1.parallelize)((0, steps_1.removeShippingMethodFromCartStep)({
            shipping_method_ids: shippingMethodsData.shippingMethodsToRemove,
        }), (0, update_shipping_methods_1.updateShippingMethodsStep)(shippingMethodsData.shippingMethodsToUpdate));
    });
    return new workflows_sdk_1.WorkflowResponse(void 0, {
        hooks: [validate],
    });
});
//# sourceMappingURL=refresh-cart-shipping-methods.js.map