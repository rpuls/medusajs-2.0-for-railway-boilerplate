"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeItemOrderEditActionWorkflow = exports.removeItemOrderEditActionWorkflowId = exports.removeOrderEditItemActionValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that an item that was added in the order edit can be removed
 * from the order edit. If the order is canceled or the order change is not active,
 * the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeOrderEditItemActionValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchact_123",
 *   }
 * })
 */
exports.removeOrderEditItemActionValidationStep = (0, workflows_sdk_1.createStep)("remove-item-order-edit-action-validation", async function ({ order, orderChange, input, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
    const associatedAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
    if (!associatedAction) {
        throw new Error(`No item found for order ${input.order_id} in order change ${orderChange.id}`);
    }
    else if (![utils_1.ChangeActionType.ITEM_ADD, utils_1.ChangeActionType.ITEM_UPDATE].includes(associatedAction.action)) {
        throw new Error(`Action ${associatedAction.id} is not adding or updating an item`);
    }
});
exports.removeItemOrderEditActionWorkflowId = "remove-item-order edit-action";
/**
 * This workflow removes an item that was added to an order edit. It's used by the
 * [Remove Item from Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_deleteordereditsiditemsaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove an item that was
 * added to an order edit in your custom flow.
 *
 * @example
 * const { result } = await removeItemOrderEditActionWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     action_id: "orchact_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an item that was added to an order edit.
 */
exports.removeItemOrderEditActionWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.removeItemOrderEditActionWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status", "canceled_at", "items.*"],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status", "version", "actions.*"],
        variables: {
            filters: {
                order_id: input.order_id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, exports.removeOrderEditItemActionValidationStep)({
        order,
        input,
        orderChange,
    });
    (0, steps_1.deleteOrderChangeActionsStep)({ ids: [input.action_id] });
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.previewOrderChangeStep)(order.id));
});
//# sourceMappingURL=remove-order-edit-item-action.js.map