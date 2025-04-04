"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentCollectionForCartWorkflow = exports.createPaymentCollectionForCartWorkflowId = exports.validateExistingPaymentCollectionStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const create_remote_links_1 = require("../../common/steps/create-remote-links");
const use_remote_query_1 = require("../../common/steps/use-remote-query");
const create_payment_collection_1 = require("../steps/create-payment-collection");
const validate_cart_1 = require("../steps/validate-cart");
/**
 * This step validates that a cart doesn't have a payment collection.
 * If the cart has a payment collection, the step throws an error.
 *
 * :::tip
 *
 * You can use the {@link retrieveCartStep} to retrieve a cart's details.
 *
 * :::
 *
 * @example
 * const data = validateExistingPaymentCollectionStep({
 *   cart: {
 *     // other cart details...
 *     payment_collection: {
 *       id: "paycol_123",
 *       // other payment collection details.
 *     }
 *   }
 * })
 */
exports.validateExistingPaymentCollectionStep = (0, workflows_sdk_1.createStep)("validate-existing-payment-collection", ({ cart }) => {
    if (cart.payment_collection) {
        throw new Error(`Cart ${cart.id} already has a payment collection`);
    }
});
exports.createPaymentCollectionForCartWorkflowId = "create-payment-collection-for-cart";
/**
 * This workflow creates a payment collection for a cart. It's executed by the
 * [Create Payment Collection Store API Route](https://docs.medusajs.com/api/store#payment-collections_postpaymentcollections).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to wrap custom logic around adding creating a payment collection for a cart.
 *
 * @example
 * const { result } = await createPaymentCollectionForCartWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     metadata: {
 *       sandbox: true
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create payment collection for cart.
 */
exports.createPaymentCollectionForCartWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createPaymentCollectionForCartWorkflowId, (input) => {
    const cart = (0, use_remote_query_1.useRemoteQueryStep)({
        entry_point: "cart",
        fields: [
            "id",
            "completed_at",
            "currency_code",
            "total",
            "raw_total",
            "payment_collection.id",
        ],
        variables: { id: input.cart_id },
        throw_if_key_not_found: true,
        list: false,
    });
    (0, workflows_sdk_1.parallelize)((0, validate_cart_1.validateCartStep)({ cart }), (0, exports.validateExistingPaymentCollectionStep)({ cart }));
    const paymentData = (0, workflows_sdk_1.transform)({ cart }, ({ cart }) => {
        return {
            currency_code: cart.currency_code,
            amount: cart.raw_total,
        };
    });
    const created = (0, create_payment_collection_1.createPaymentCollectionsStep)([paymentData]);
    const cartPaymentLink = (0, workflows_sdk_1.transform)({ cartId: input.cart_id, created }, (data) => {
        return [
            {
                [utils_1.Modules.CART]: { cart_id: data.cartId },
                [utils_1.Modules.PAYMENT]: { payment_collection_id: data.created[0].id },
            },
        ];
    });
    (0, create_remote_links_1.createRemoteLinkStep)(cartPaymentLink).config({
        name: "cart-payment-collection-link",
    });
});
//# sourceMappingURL=create-payment-collection-for-cart.js.map