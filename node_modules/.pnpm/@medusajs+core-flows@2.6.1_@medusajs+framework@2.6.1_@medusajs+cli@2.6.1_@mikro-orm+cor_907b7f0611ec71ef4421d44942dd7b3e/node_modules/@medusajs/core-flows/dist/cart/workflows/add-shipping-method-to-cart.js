"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addShippingMethodToCartWorkflow = exports.addShippingMethodToCartWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const use_remote_query_1 = require("../../common/steps/use-remote-query");
const steps_1 = require("../steps");
const validate_cart_1 = require("../steps/validate-cart");
const validate_shipping_methods_data_1 = require("../steps/validate-shipping-methods-data");
const validate_shipping_options_price_1 = require("../steps/validate-shipping-options-price");
const fields_1 = require("../utils/fields");
const list_shipping_options_for_cart_with_pricing_1 = require("./list-shipping-options-for-cart-with-pricing");
const refresh_cart_items_1 = require("./refresh-cart-items");
exports.addShippingMethodToCartWorkflowId = "add-shipping-method-to-cart";
/**
 * This workflow adds a shipping method to a cart. It's executed by the
 * [Add Shipping Method Store API Route](https://docs.medusajs.com/api/store#carts_postcartsidshippingmethods).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to wrap custom logic around adding a shipping method to the cart.
 *
 * @example
 * const { result } = await addShippingMethodToCartWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     options: [
 *       {
 *         id: "so_123",
 *       },
 *       {
 *         id: "so_124",
 *         data: {
 *           carrier_code: "fedex",
 *         }
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Add a shipping method to a cart.
 *
 * @property hooks.validate - This hook is executed before all operations. You can consume this hook to perform any custom validation. If validation fails, you can throw an error to stop the workflow execution.
 */
exports.addShippingMethodToCartWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.addShippingMethodToCartWorkflowId, (input) => {
    const cart = (0, use_remote_query_1.useRemoteQueryStep)({
        entry_point: "cart",
        fields: fields_1.cartFieldsForRefreshSteps,
        variables: { id: input.cart_id },
        list: false,
        throw_if_key_not_found: true,
    });
    (0, validate_cart_1.validateCartStep)({ cart });
    const validate = (0, workflows_sdk_1.createHook)("validate", {
        input,
        cart,
    });
    const optionIds = (0, workflows_sdk_1.transform)({ input }, (data) => {
        return (data.input.options ?? []).map((i) => i.id);
    });
    (0, steps_1.validateCartShippingOptionsStep)({
        option_ids: optionIds,
        cart,
        shippingOptionsContext: { is_return: "false", enabled_in_store: "true" },
    });
    const shippingOptions = list_shipping_options_for_cart_with_pricing_1.listShippingOptionsForCartWithPricingWorkflow.runAsStep({
        input: {
            options: input.options,
            cart_id: cart.id,
            is_return: false,
        },
    });
    (0, validate_shipping_options_price_1.validateCartShippingOptionsPriceStep)({ shippingOptions });
    const validateShippingMethodsDataInput = (0, workflows_sdk_1.transform)({ input, shippingOptions, cart }, ({ input, shippingOptions, cart }) => {
        return input.options.map((inputOption) => {
            const shippingOption = shippingOptions.find((so) => so.id === inputOption.id);
            return {
                id: inputOption.id,
                provider_id: shippingOption?.provider_id,
                option_data: shippingOption?.data ?? {},
                method_data: inputOption.data ?? {},
                context: {
                    ...cart,
                    from_location: shippingOption?.stock_location ?? {},
                },
            };
        });
    });
    const validatedMethodData = (0, validate_shipping_methods_data_1.validateAndReturnShippingMethodsDataStep)(validateShippingMethodsDataInput);
    const shippingMethodInput = (0, workflows_sdk_1.transform)({
        input,
        shippingOptions,
        validatedMethodData,
    }, (data) => {
        const options = (data.input.options ?? []).map((option) => {
            const shippingOption = data.shippingOptions.find((so) => so.id === option.id);
            if (!shippingOption?.calculated_price) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Shipping option with ID ${shippingOption.id} do not have a price`);
            }
            const methodData = data.validatedMethodData?.find((methodData) => {
                return methodData?.[option.id];
            });
            return {
                shipping_option_id: shippingOption.id,
                amount: shippingOption.calculated_price.calculated_amount,
                is_tax_inclusive: !!shippingOption.calculated_price
                    .is_calculated_price_tax_inclusive,
                data: methodData?.[option.id] ?? {},
                name: shippingOption.name,
                cart_id: data.input.cart_id,
            };
        });
        return options;
    });
    const currentShippingMethods = (0, workflows_sdk_1.transform)({ cart }, ({ cart }) => cart.shipping_methods.map((sm) => sm.id));
    const [, createdShippingMethods] = (0, workflows_sdk_1.parallelize)((0, steps_1.removeShippingMethodFromCartStep)({
        shipping_method_ids: currentShippingMethods,
    }), (0, steps_1.addShippingMethodToCartStep)({
        shipping_methods: shippingMethodInput,
    }), (0, emit_event_1.emitEventStep)({
        eventName: utils_1.CartWorkflowEvents.UPDATED,
        data: { id: input.cart_id },
    }));
    refresh_cart_items_1.refreshCartItemsWorkflow.runAsStep({
        input: { cart_id: cart.id, shipping_methods: createdShippingMethods },
    });
    return new workflows_sdk_1.WorkflowResponse(void 0, {
        hooks: [validate],
    });
});
//# sourceMappingURL=add-shipping-method-to-cart.js.map