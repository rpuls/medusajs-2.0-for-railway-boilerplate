"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderPaymentCollectionWorkflow = exports.createOrderPaymentCollectionWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const cart_1 = require("../../cart");
exports.createOrderPaymentCollectionWorkflowId = "create-order-payment-collection";
/**
 * This workflow creates a payment collection for an order. It's used by the
 * [Create Payment Collection Admin API Route](https://docs.medusajs.com/api/admin#payment-collections_postpaymentcollections).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * creating a payment collection for an order.
 *
 * @example
 * const { result } = await createOrderPaymentCollectionWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     amount: 10,
 *   }
 * })
 *
 * @summary
 *
 * Create a payment collection for an order.
 */
exports.createOrderPaymentCollectionWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createOrderPaymentCollectionWorkflowId, (input) => {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "order",
        fields: ["id", "summary", "currency_code", "region_id"],
        variables: { id: input.order_id },
        throw_if_key_not_found: true,
        list: false,
    });
    const paymentCollectionData = (0, workflows_sdk_1.transform)({ order, input }, ({ order, input }) => {
        return {
            currency_code: order.currency_code,
            amount: input.amount,
        };
    });
    const createdPaymentCollections = (0, cart_1.createPaymentCollectionsStep)([
        paymentCollectionData,
    ]);
    const orderPaymentCollectionLink = (0, workflows_sdk_1.transform)({ order, createdPaymentCollections }, ({ order, createdPaymentCollections }) => {
        return [
            {
                [utils_1.Modules.ORDER]: { order_id: order.id },
                [utils_1.Modules.PAYMENT]: {
                    payment_collection_id: createdPaymentCollections[0].id,
                },
            },
        ];
    });
    (0, common_1.createRemoteLinkStep)(orderPaymentCollectionLink).config({
        name: "order-payment-collection-link",
    });
    return new workflows_sdk_1.WorkflowResponse(createdPaymentCollections);
});
//# sourceMappingURL=create-order-payment-collection.js.map