"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeItemReceiveReturnActionWorkflow = exports.removeItemReceiveReturnActionWorkflowId = exports.removeItemReceiveReturnActionValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a return receival's item can be removed.
 * If the order or return is canceled, the order change is not active,
 * the return request is not found,
 * or the action is not a receive return action, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeItemReceiveReturnActionValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
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
 *   }
 * })
 */
exports.removeItemReceiveReturnActionValidationStep = (0, workflows_sdk_1.createStep)("remove-item-receive-return-action-validation", async function ({ order, orderChange, orderReturn, input, }) {
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
        throw new Error(`Action ${associatedAction.id} is not receiving item return`);
    }
});
exports.removeItemReceiveReturnActionWorkflowId = "remove-item-receive-return-action";
/**
 * This workflow removes an item from a return receival. It's used by the
 * [Remove a Received Item from Return Admin API Route](https://docs.medusajs.com/api/admin#returns_deletereturnsidreceiveitemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove an item from a return receival
 * in your custom flow.
 *
 * @example
 * const { result } = await removeItemReceiveReturnActionWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     action_id: "orchac_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an item from a return receival.
 */
exports.removeItemReceiveReturnActionWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.removeItemReceiveReturnActionWorkflowId, function (input) {
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
    (0, exports.removeItemReceiveReturnActionValidationStep)({
        order,
        input,
        orderReturn,
        orderChange,
    });
    (0, steps_1.deleteOrderChangeActionsStep)({ ids: [input.action_id] });
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.previewOrderChangeStep)(order.id));
});
//# sourceMappingURL=remove-item-receive-return-action.js.map