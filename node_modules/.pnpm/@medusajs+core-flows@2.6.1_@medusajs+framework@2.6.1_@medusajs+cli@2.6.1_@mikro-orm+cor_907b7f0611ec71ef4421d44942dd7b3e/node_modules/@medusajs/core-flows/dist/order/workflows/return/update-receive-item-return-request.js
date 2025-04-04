"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReceiveItemReturnRequestWorkflow = exports.updateReceiveItemReturnRequestWorkflowId = exports.updateReceiveItemReturnRequestValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that an item can be updated in a return receival request.
 * If the order or return is canceled, the order change is not active,
 * the return request is not found, or the action is not receiving an item return request,
 * the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateReceiveItemReturnRequestValidationStep({
 *   order: {
 *     id: "order_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         // other item details...
 *       }
 *     ]
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other return details...
 *   },
 *   input: {
 *     return_id: "return_123",
 *     action_id: "orchac_123",
 *     data: {
 *       quantity: 1,
 *     }
 *   }
 * })
 */
exports.updateReceiveItemReturnRequestValidationStep = (0, workflows_sdk_1.createStep)("update-receive-item-return-request-validation", async function ({ order, orderChange, orderReturn, input, }, context) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfIsCancelled)(orderReturn, "Return");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
    const associatedAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
    if (!associatedAction) {
        throw new Error(`No request return found for return ${input.return_id} in order change ${orderChange.id}`);
    }
    else if (![
        utils_1.ChangeActionType.RECEIVE_RETURN_ITEM,
        utils_1.ChangeActionType.RECEIVE_DAMAGED_RETURN_ITEM,
    ].includes(associatedAction.action)) {
        throw new Error(`Action ${associatedAction.id} is not receiving an item return request`);
    }
});
exports.updateReceiveItemReturnRequestWorkflowId = "update-receive-item-return-request";
/**
 * This workflow updates an item in a return receival request. It's used by the
 * [Update a Received Item in a Return Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsidreceiveitemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update an item in a return receival request
 * in your custom flows.
 *
 * @example
 * const { result } = await updateReceiveItemReturnRequestWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     action_id: "orchac_123",
 *     data: {
 *       quantity: 1,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update an item in a return receival request.
 */
exports.updateReceiveItemReturnRequestWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateReceiveItemReturnRequestWorkflowId, function (input) {
    const orderReturn = (0, common_1.useRemoteQueryStep)({
        entry_point: "return",
        fields: ["id", "status", "order_id", "canceled_at"],
        variables: { id: input.return_id },
        list: false,
        throw_if_key_not_found: true,
    });
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status", "canceled_at", "items.*"],
        variables: { id: orderReturn.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status", "version", "actions.*"],
        variables: {
            filters: {
                order_id: orderReturn.order_id,
                return_id: orderReturn.id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, exports.updateReceiveItemReturnRequestValidationStep)({
        order,
        input,
        orderReturn,
        orderChange,
    });
    const updateData = (0, workflows_sdk_1.transform)({ orderChange, input }, ({ input, orderChange }) => {
        const originalAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
        const data = input.data;
        return {
            id: input.action_id,
            details: {
                quantity: data.quantity ?? originalAction.details?.quantity,
            },
            internal_note: data.internal_note,
        };
    });
    (0, steps_1.updateOrderChangeActionsStep)([updateData]);
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.previewOrderChangeStep)(order.id));
});
//# sourceMappingURL=update-receive-item-return-request.js.map