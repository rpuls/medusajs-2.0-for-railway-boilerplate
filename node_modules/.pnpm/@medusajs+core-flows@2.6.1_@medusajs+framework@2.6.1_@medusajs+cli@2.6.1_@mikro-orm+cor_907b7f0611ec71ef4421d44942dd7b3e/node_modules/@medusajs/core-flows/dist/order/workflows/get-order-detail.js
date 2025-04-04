"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderDetailWorkflow = exports.getOrderDetailWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const aggregate_status_1 = require("../utils/aggregate-status");
exports.getOrderDetailWorkflowId = "get-order-detail";
/**
 * This workflow retrieves an order's details. It's used by many API routes, including
 * [Get an Order Admin API Route](https://docs.medusajs.com/api/admin#orders_getordersid), and
 * [Get an Order Store API Route](https://docs.medusajs.com/api/store#orders_getordersid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to retrieve an
 * order's details in your custom flows.
 *
 * @example
 * const { result } = await getOrderDetailWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     fields: ["id", "status", "items"]
 *   }
 * })
 *
 * @summary
 *
 * Retrieve an order's details.
 */
exports.getOrderDetailWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.getOrderDetailWorkflowId, (input) => {
    const fields = (0, workflows_sdk_1.transform)(input, ({ fields }) => {
        return (0, utils_1.deduplicate)([
            ...fields,
            "id",
            "status",
            "version",
            "payment_collections.*",
            "fulfillments.*",
        ]);
    });
    const variables = (0, workflows_sdk_1.transform)({ input }, ({ input }) => {
        return { ...input.filters, id: input.order_id, version: input.version };
    });
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields,
        variables,
        list: false,
        throw_if_key_not_found: true,
    });
    const aggregatedOrder = (0, workflows_sdk_1.transform)({ order }, ({ order }) => {
        const order_ = order;
        order_.payment_status = (0, aggregate_status_1.getLastPaymentStatus)(order_);
        order_.fulfillment_status = (0, aggregate_status_1.getLastFulfillmentStatus)(order_);
        return order_;
    });
    return new workflows_sdk_1.WorkflowResponse(aggregatedOrder);
});
//# sourceMappingURL=get-order-detail.js.map