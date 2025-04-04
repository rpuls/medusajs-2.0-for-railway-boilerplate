"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshPaymentCollectionForCartWorkflow = exports.refreshPaymentCollectionForCartWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const use_remote_query_1 = require("../../common/steps/use-remote-query");
const payment_collection_1 = require("../../payment-collection");
const delete_payment_sessions_1 = require("../../payment-collection/workflows/delete-payment-sessions");
exports.refreshPaymentCollectionForCartWorkflowId = "refresh-payment-collection-for-cart";
/**
 * This workflow refreshes a cart's payment collection, which is useful once the cart is created or when its details
 * are updated. If the cart's total changes to the amount in its payment collection, the payment collection's payment sessions are
 * deleted. It also syncs the payment collection's amount, currency code, and other details with the details in the cart.
 *
 * This workflow is used by other cart-related workflows, such as the {@link refreshCartItemsWorkflow} to refresh the cart's
 * payment collection after an update.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to refresh the cart's payment collection after making updates to it in your
 * custom flows.
 *
 * @example
 * const { result } = await refreshPaymentCollectionForCartWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *   }
 * })
 *
 * @summary
 *
 * Refresh a cart's payment collection details.
 *
 * @property hooks.validate - This hook is executed before all operations. You can consume this hook to perform any custom validation. If validation fails, you can throw an error to stop the workflow execution.
 */
exports.refreshPaymentCollectionForCartWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.refreshPaymentCollectionForCartWorkflowId, (input) => {
    const fetchCart = (0, workflows_sdk_1.when)({ input }, ({ input }) => {
        return !input.cart;
    }).then(() => {
        return (0, use_remote_query_1.useRemoteQueryStep)({
            entry_point: "cart",
            fields: [
                "id",
                "region_id",
                "currency_code",
                "total",
                "raw_total",
                "payment_collection.id",
                "payment_collection.raw_amount",
                "payment_collection.amount",
                "payment_collection.currency_code",
                "payment_collection.payment_sessions.id",
            ],
            variables: { id: input.cart_id },
            throw_if_key_not_found: true,
            list: false,
        });
    });
    const cart = (0, workflows_sdk_1.transform)({ fetchCart, input }, ({ fetchCart, input }) => {
        return input.cart ?? fetchCart;
    });
    const validate = (0, workflows_sdk_1.createHook)("validate", {
        input,
        cart,
    });
    (0, workflows_sdk_1.when)({ cart }, ({ cart }) => {
        const valueIsEqual = utils_1.MathBN.eq(cart.payment_collection?.raw_amount ?? -1, cart.raw_total);
        if (valueIsEqual) {
            return cart.payment_collection.currency_code !== cart.currency_code;
        }
        return true;
    }).then(() => {
        const deletePaymentSessionInput = (0, workflows_sdk_1.transform)({ paymentCollection: cart.payment_collection }, (data) => {
            return {
                ids: data.paymentCollection?.payment_sessions
                    ?.map((ps) => ps.id)
                    ?.flat(1) || [],
            };
        });
        const updatePaymentCollectionInput = (0, workflows_sdk_1.transform)({ cart }, ({ cart }) => {
            if (!(0, utils_1.isPresent)(cart.payment_collection?.id)) {
                return;
            }
            return {
                selector: { id: cart.payment_collection.id },
                update: {
                    amount: cart.total,
                    currency_code: cart.currency_code,
                },
            };
        });
        (0, workflows_sdk_1.parallelize)(delete_payment_sessions_1.deletePaymentSessionsWorkflow.runAsStep({
            input: deletePaymentSessionInput,
        }), (0, payment_collection_1.updatePaymentCollectionStep)(updatePaymentCollectionInput));
    });
    return new workflows_sdk_1.WorkflowResponse(void 0, {
        hooks: [validate],
    });
});
//# sourceMappingURL=refresh-payment-collection.js.map