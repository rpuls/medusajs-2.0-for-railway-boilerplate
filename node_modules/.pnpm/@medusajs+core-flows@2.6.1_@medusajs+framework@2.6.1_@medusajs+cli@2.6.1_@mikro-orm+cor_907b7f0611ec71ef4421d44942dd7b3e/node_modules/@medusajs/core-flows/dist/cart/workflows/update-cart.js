"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartWorkflow = exports.updateCartWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const line_item_1 = require("../../line-item");
const steps_1 = require("../steps");
const validate_sales_channel_1 = require("../steps/validate-sales-channel");
const refresh_cart_items_1 = require("./refresh-cart-items");
exports.updateCartWorkflowId = "update-cart";
/**
 * This workflow updates a cart and returns it. You can update the cart's region, address, and more. This workflow is executed by the
 * [Update Cart Store API Route](https://docs.medusajs.com/api/store#carts_postcartsid).
 *
 * :::note
 *
 * This workflow doesn't allow updating a cart's line items. Instead, use {@link addToCartWorkflow} and {@link updateLineItemInCartWorkflow}.
 *
 * :::
 *
 * This workflow has a hook that allows you to perform custom actions on the updated cart. For example, you can pass custom data under the `additional_data` property of the Update Cart API route,
 * then update any associated details related to the cart in the workflow's hook.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around updating a cart.
 *
 * @example
 * const { result } = await updateCartWorkflow(container)
 * .run({
 *   input: {
 *     id: "cart_123",
 *     region_id: "region_123",
 *     shipping_address: {
 *       first_name: "John",
 *       last_name: "Doe",
 *       address_1: "1234 Main St",
 *       city: "San Francisco",
 *       country_code: "US",
 *       postal_code: "94111",
 *       phone: "1234567890",
 *     },
 *     additional_data: {
 *       external_id: "123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update a cart's details, such as region, address, and more.
 *
 * @property hooks.validate - This hook is executed before all operations. You can consume this hook to perform any custom validation. If validation fails, you can throw an error to stop the workflow execution.
 * @property hooks.cartUpdated - This hook is executed after a cart is update. You can consume this hook to perform custom actions on the updated cart.
 */
exports.updateCartWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateCartWorkflowId, (input) => {
    const cartToUpdate = (0, common_1.useRemoteQueryStep)({
        entry_point: "cart",
        variables: { id: input.id },
        fields: [
            "id",
            "email",
            "customer_id",
            "sales_channel_id",
            "shipping_address.*",
            "region.*",
            "region.countries.*",
        ],
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "get-cart" });
    const cartDataInput = (0, workflows_sdk_1.transform)({ input, cartToUpdate }, (data) => {
        return {
            sales_channel_id: data.input.sales_channel_id ?? data.cartToUpdate.sales_channel_id,
            customer_id: data.cartToUpdate.customer_id,
            email: data.input.email ?? data.cartToUpdate.email,
        };
    });
    const [salesChannel, customer] = (0, workflows_sdk_1.parallelize)((0, steps_1.findSalesChannelStep)({
        salesChannelId: cartDataInput.sales_channel_id,
    }), (0, steps_1.findOrCreateCustomerStep)({
        customerId: cartDataInput.customer_id,
        email: cartDataInput.email,
    }));
    (0, validate_sales_channel_1.validateSalesChannelStep)({ salesChannel });
    const newRegion = (0, workflows_sdk_1.when)({ input }, (data) => {
        return !!data.input.region_id;
    }).then(() => {
        return (0, common_1.useRemoteQueryStep)({
            entry_point: "region",
            variables: { id: input.region_id },
            fields: ["id", "countries.*", "currency_code", "name"],
            list: false,
            throw_if_key_not_found: true,
        }).config({ name: "get-region" });
    });
    const region = (0, workflows_sdk_1.transform)({ cartToUpdate, newRegion }, (data) => {
        return data.newRegion ?? data.cartToUpdate.region;
    });
    const cartInput = (0, workflows_sdk_1.transform)({
        input,
        region,
        customer,
        salesChannel,
        cartToUpdate,
    }, (data) => {
        const { promo_codes, additional_data: _, ...updateCartData } = data.input;
        const data_ = {
            ...updateCartData,
            currency_code: data.region?.currency_code,
            region_id: data.region?.id, // This is either the region from the input or the region from the cart or null
        };
        // When the region is updated, we do a few things:
        // - We need to make sure the provided shipping address country code is in the new region
        // - We clear the shipping address if the new region has more than one country
        const regionIsNew = data.region?.id !== data.cartToUpdate.region?.id;
        const shippingAddress = data.input.shipping_address;
        if (shippingAddress?.country_code) {
            const country = data.region.countries.find((c) => c.iso_2 === shippingAddress.country_code);
            if (!country) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Country with code ${shippingAddress.country_code} is not within region ${data.region.name}`);
            }
            data_.shipping_address = {
                ...shippingAddress,
                country_code: country.iso_2,
            };
        }
        if (regionIsNew) {
            if (data.region.countries.length === 1) {
                data_.shipping_address = {
                    country_code: data.region.countries[0].iso_2,
                };
            }
            if (!data_.shipping_address?.country_code) {
                data_.shipping_address = null;
            }
        }
        if ((0, utils_1.isDefined)(updateCartData.email) && data.customer?.customer) {
            const currentCustomer = data.customer.customer;
            data_.customer_id = currentCustomer.id;
            // registered customers can update the cart email
            if (currentCustomer.has_account) {
                data_.email = updateCartData.email;
            }
            else {
                data_.email = data.customer.email;
            }
        }
        if ((0, utils_1.isDefined)(updateCartData.sales_channel_id)) {
            data_.sales_channel_id = data.salesChannel.id;
        }
        return data_;
    });
    const validate = (0, workflows_sdk_1.createHook)("validate", {
        input: cartInput,
        cart: cartToUpdate,
    });
    /*
    when({ cartInput }, ({ cartInput }) => {
      return isDefined(cartInput.customer_id) || isDefined(cartInput.email)
    }).then(() => {
      emitEventStep({
        eventName: CartWorkflowEvents.CUSTOMER_UPDATED,
        data: { id: input.id },
      }).config({ name: "emit-customer-updated" })
    })
    */
    const regionUpdated = (0, workflows_sdk_1.transform)({ input, cartToUpdate }, ({ input, cartToUpdate }) => {
        return ((0, utils_1.isDefined)(input.region_id) &&
            input.region_id !== cartToUpdate?.region?.id);
    });
    (0, workflows_sdk_1.when)({ regionUpdated }, ({ regionUpdated }) => {
        return !!regionUpdated;
    }).then(() => {
        (0, common_1.emitEventStep)({
            eventName: utils_1.CartWorkflowEvents.REGION_UPDATED,
            data: { id: input.id },
        }).config({ name: "emit-region-updated" });
    });
    (0, workflows_sdk_1.parallelize)((0, steps_1.updateCartsStep)([cartInput]), (0, common_1.emitEventStep)({
        eventName: utils_1.CartWorkflowEvents.UPDATED,
        data: { id: input.id },
    }));
    // In case the region is updated, we might have a new currency OR tax inclusivity setting
    // Therefore, we need to delete line items with a custom price for good measure
    (0, workflows_sdk_1.when)({ regionUpdated }, ({ regionUpdated }) => {
        return !!regionUpdated;
    }).then(() => {
        const lineItems = (0, common_1.useQueryGraphStep)({
            entity: "line_items",
            filters: {
                cart_id: input.id,
                is_custom_price: true,
            },
            fields: ["id"],
        });
        const lineItemIds = (0, workflows_sdk_1.transform)({ lineItems }, ({ lineItems }) => {
            return lineItems.data.map((i) => i.id);
        });
        (0, line_item_1.deleteLineItemsStep)(lineItemIds);
    });
    const cart = refresh_cart_items_1.refreshCartItemsWorkflow.runAsStep({
        input: {
            cart_id: cartInput.id,
            promo_codes: input.promo_codes,
            force_refresh: !!newRegion,
        },
    });
    const cartUpdated = (0, workflows_sdk_1.createHook)("cartUpdated", {
        cart,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(void 0, {
        hooks: [validate, cartUpdated],
    });
});
//# sourceMappingURL=update-cart.js.map