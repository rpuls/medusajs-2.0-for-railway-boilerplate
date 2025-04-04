"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersListWorkflow = exports.getOrdersListWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const aggregate_status_1 = require("../utils/aggregate-status");
exports.getOrdersListWorkflowId = "get-orders-list";
/**
 * This workflow retrieves a list of orders. It's used by the
 * [List Orders Admin API Route](https://docs.medusajs.com/api/admin#orders_getorders), and the
 * [List Orders Store API Route](https://docs.medusajs.com/api/store#orders_getorders).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to retrieve a list of
 * orders in your custom flows. For example, you can retrieve the list of orders to export them
 * to a third-party system.
 *
 * @example
 * To retrieve the list of orders:
 *
 * ```ts
 * const { result } = await getOrdersListWorkflow(container)
 * .run({
 *   input: {
 *     fields: ["id", "status", "items"],
 *   }
 * })
 * ```
 *
 * To retrieve the list of orders with pagination:
 *
 * ```ts
 * const { result } = await getOrdersListWorkflow(container)
 * .run({
 *   input: {
 *     fields: ["id", "status", "items"],
 *     variables: {
 *       skip: 0,
 *       take: 15,
 *     }
 *   }
 * })
 * ```
 *
 * @summary
 *
 * Retrieve a list of orders.
 */
exports.getOrdersListWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.getOrdersListWorkflowId, (input) => {
    const fields = (0, workflows_sdk_1.transform)(input, ({ fields }) => {
        return (0, utils_1.deduplicate)([
            ...fields,
            "id",
            "status",
            "version",
            "items.*",
            "payment_collections.status",
            "payment_collections.amount",
            "payment_collections.captured_amount",
            "payment_collections.refunded_amount",
            "fulfillments.packed_at",
            "fulfillments.shipped_at",
            "fulfillments.delivered_at",
            "fulfillments.canceled_at",
        ]);
    });
    const orders = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields,
        variables: input.variables,
        list: true,
    });
    const aggregatedOrders = (0, workflows_sdk_1.transform)({ orders, input }, ({ orders, input }) => {
        const fields = input.fields;
        const requiredPaymentFields = fields.some((f) => f.includes("payment_collections"));
        const requiredFulfillmentFields = fields.some((f) => f.includes("fulfillments"));
        const orders_ = orders;
        const data = orders_.rows ? orders_.rows : orders_;
        for (const order of data) {
            const order_ = order;
            order_.payment_status = (0, aggregate_status_1.getLastPaymentStatus)(order_);
            order_.fulfillment_status = (0, aggregate_status_1.getLastFulfillmentStatus)(order_);
            if (!requiredPaymentFields) {
                // @ts-ignore
                delete order_.payment_collections;
            }
            if (!requiredFulfillmentFields) {
                // @ts-ignore
                delete order_.fulfillments;
            }
        }
        return orders;
    });
    return new workflows_sdk_1.WorkflowResponse(aggregatedOrders);
});
//# sourceMappingURL=get-orders-list.js.map