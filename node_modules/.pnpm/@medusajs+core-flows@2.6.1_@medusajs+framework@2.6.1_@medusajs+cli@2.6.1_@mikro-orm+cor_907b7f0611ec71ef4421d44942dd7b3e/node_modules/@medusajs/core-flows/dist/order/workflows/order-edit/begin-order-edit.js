"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beginOrderEditOrderWorkflow = exports.beginOrderEditOrderWorkflowId = exports.beginOrderEditValidationStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const create_order_change_1 = require("../../steps/create-order-change");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that an order-edit can be requested for an order.
 * If the order is canceled, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = beginOrderEditValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   }
 * })
 */
exports.beginOrderEditValidationStep = (0, workflows_sdk_1.createStep)("begin-order-edit-validation", async function ({ order }) {
    (0, order_validation_1.throwIfOrderIsCancelled)({ order });
});
exports.beginOrderEditOrderWorkflowId = "begin-order-edit-order";
/**
 * This workflow creates an order edit request. It' used by the
 * [Create Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postorderedits).
 *
 * To request the order edit, use the {@link requestOrderEditRequestWorkflow}. The order edit is then only applied after the
 * order edit is confirmed using the {@link confirmOrderEditRequestWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to create an order edit
 * for an order in your custom flows.
 *
 * @example
 * const { result } = await beginOrderEditOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Create an order edit request.
 */
exports.beginOrderEditOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.beginOrderEditOrderWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status"],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    });
    (0, exports.beginOrderEditValidationStep)({ order });
    const orderChangeInput = (0, workflows_sdk_1.transform)({ input }, ({ input }) => {
        return {
            change_type: "edit",
            order_id: input.order_id,
            created_by: input.created_by,
            description: input.description,
            internal_note: input.internal_note,
        };
    });
    return new workflows_sdk_1.WorkflowResponse((0, create_order_change_1.createOrderChangeStep)(orderChangeInput));
});
//# sourceMappingURL=begin-order-edit.js.map