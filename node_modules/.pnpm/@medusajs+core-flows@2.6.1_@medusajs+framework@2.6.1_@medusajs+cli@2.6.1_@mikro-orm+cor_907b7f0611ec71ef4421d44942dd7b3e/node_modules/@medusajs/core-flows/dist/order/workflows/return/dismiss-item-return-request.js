"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dismissItemReturnRequestWorkflow = exports.dismissItemReturnRequestWorkflowId = exports.dismissItemReturnRequestValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
const create_order_change_actions_1 = require("../create-order-change-actions");
/**
 * This step validates that a return request can have its items dismissed.
 * If the order or return is canceled, the order change is not active,
 * or the items do not exist in the return, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = dismissItemReturnRequestValidationStep({
 *   order: {
 *     id: "order_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         // other item details...
 *       }
 *     ]
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other return details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   items: [
 *     {
 *       id: "orli_123",
 *       quantity: 1,
 *     }
 *   ]
 * })
 */
exports.dismissItemReturnRequestValidationStep = (0, workflows_sdk_1.createStep)("dismiss-item-return-request-validation", async function ({ order, orderChange, orderReturn, items, }, context) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfIsCancelled)(orderReturn, "Return");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
    (0, order_validation_1.throwIfItemsDoesNotExistsInReturn)({ orderReturn, inputItems: items });
});
exports.dismissItemReturnRequestWorkflowId = "dismiss-item-return-request";
/**
 * This workflow dismisses items from a return request due to them being damaged. It's used
 * by the [Add Damaged Items Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsiddismissitems).
 *
 * A damaged item's quantity is dismissed, meaning it's not returned to the inventory.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to dismiss items from a return request in your custom flow.
 *
 * @example
 * const { result } = await dismissItemReturnRequestWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Dismiss items from a return request.
 */
exports.dismissItemReturnRequestWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.dismissItemReturnRequestWorkflowId, function (input) {
    const orderReturn = (0, common_1.useRemoteQueryStep)({
        entry_point: "return",
        fields: ["id", "status", "order_id", "canceled_at", "items.*"],
        variables: { id: input.return_id },
        list: false,
        throw_if_key_not_found: true,
    });
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status", "canceled_at"],
        variables: { id: orderReturn.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status", "order_id", "return_id"],
        variables: {
            filters: {
                order_id: orderReturn.order_id,
                return_id: orderReturn.id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, exports.dismissItemReturnRequestValidationStep)({
        order,
        items: input.items,
        orderReturn,
        orderChange,
    });
    const orderChangeActionInput = (0, workflows_sdk_1.transform)({ order, orderChange, orderReturn, items: input.items }, ({ order, orderChange, orderReturn, items }) => {
        return items.map((item) => ({
            order_change_id: orderChange.id,
            order_id: order.id,
            return_id: orderReturn.id,
            version: orderChange.version,
            action: utils_1.ChangeActionType.RECEIVE_DAMAGED_RETURN_ITEM,
            internal_note: item.internal_note,
            reference: "return",
            reference_id: orderReturn.id,
            details: {
                reference_id: item.id,
                quantity: item.quantity,
            },
        }));
    });
    create_order_change_actions_1.createOrderChangeActionsWorkflow.runAsStep({
        input: orderChangeActionInput,
    });
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.previewOrderChangeStep)(order.id));
});
//# sourceMappingURL=dismiss-item-return-request.js.map