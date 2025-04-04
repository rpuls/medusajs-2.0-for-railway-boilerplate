"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beginReturnOrderWorkflow = exports.beginReturnOrderWorkflowId = exports.beginReturnOrderValidationStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a return can be created for an order.
 * If the order is canceled, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = beginReturnOrderValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   }
 * })
 */
exports.beginReturnOrderValidationStep = (0, workflows_sdk_1.createStep)("begin-return-order-validation", async function ({ order }) {
    (0, order_validation_1.throwIfOrderIsCancelled)({ order });
});
exports.beginReturnOrderWorkflowId = "begin-return-order";
/**
 * This workflow creates an order return that can be later requested or confirmed.
 * It's used by the [Create Return Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturns).
 *
 * You can start the return receival using the {@link beginReceiveReturnWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to create a return for an order in your custom flow.
 *
 * @example
 * const { result } = await beginReturnOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123"
 *   }
 * })
 *
 * @summary
 *
 * Create a return for an order.
 */
exports.beginReturnOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.beginReturnOrderWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status"],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    });
    (0, exports.beginReturnOrderValidationStep)({ order });
    const created = (0, steps_1.createReturnsStep)([
        {
            order_id: input.order_id,
            location_id: input.location_id,
            metadata: input.metadata,
            created_by: input.created_by,
        },
    ]);
    const orderChangeInput = (0, workflows_sdk_1.transform)({ created, input }, ({ created, input }) => {
        return {
            change_type: "return_request",
            order_id: input.order_id,
            return_id: created[0].id,
            created_by: input.created_by,
            description: input.description,
            internal_note: input.internal_note,
        };
    });
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.createOrderChangeStep)(orderChangeInput));
});
//# sourceMappingURL=begin-return.js.map