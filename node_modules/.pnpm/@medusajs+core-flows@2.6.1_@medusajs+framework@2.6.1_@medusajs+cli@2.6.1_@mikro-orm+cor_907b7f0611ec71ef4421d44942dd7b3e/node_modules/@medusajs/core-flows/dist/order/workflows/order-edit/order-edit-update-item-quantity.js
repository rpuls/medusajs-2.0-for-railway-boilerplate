"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderEditUpdateItemQuantityWorkflow = exports.orderEditUpdateItemQuantityWorkflowId = exports.orderEditUpdateItemQuantityValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const preview_order_change_1 = require("../../steps/preview-order-change");
const order_validation_1 = require("../../utils/order-validation");
const create_order_change_actions_1 = require("../create-order-change-actions");
/**
 * This step validates that the quantity of an existing item in an order can be updated in an order edit.
 * If the order is canceled or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = orderEditUpdateItemQuantityValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   }
 * })
 */
exports.orderEditUpdateItemQuantityValidationStep = (0, workflows_sdk_1.createStep)("order-edit-update-item-quantity-validation", async function ({ order, orderChange, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
});
exports.orderEditUpdateItemQuantityWorkflowId = "order-edit-update-item-quantity";
/**
 * This workflow updates the quantity of an existing item in an order's edit. It's used by the
 * [Update Order Item Quantity Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsiditemsitemitem_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to update the quantity of an existing
 * item in an order's edit in your custom flow.
 *
 * @example
 * const { result } = await orderEditUpdateItemQuantityWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 2,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update the quantity of an existing order item in the order's edit.
 */
exports.orderEditUpdateItemQuantityWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.orderEditUpdateItemQuantityWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status", "canceled_at", "items.*"],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status"],
        variables: {
            filters: {
                order_id: input.order_id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, exports.orderEditUpdateItemQuantityValidationStep)({
        order,
        orderChange,
    });
    const orderChangeActionInput = (0, workflows_sdk_1.transform)({ order, orderChange, items: input.items }, ({ order, orderChange, items }) => {
        return items.map((item) => {
            const existing = order?.items?.find((exItem) => exItem.id === item.id);
            const quantityDiff = new utils_1.BigNumber(utils_1.MathBN.sub(item.quantity, existing.quantity));
            return {
                order_change_id: orderChange.id,
                order_id: order.id,
                version: orderChange.version,
                action: utils_1.ChangeActionType.ITEM_UPDATE,
                internal_note: item.internal_note,
                details: {
                    reference_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    compare_at_unit_price: item.compare_at_unit_price,
                    quantity_diff: quantityDiff,
                },
            };
        });
    });
    create_order_change_actions_1.createOrderChangeActionsWorkflow.runAsStep({
        input: orderChangeActionInput,
    });
    return new workflows_sdk_1.WorkflowResponse((0, preview_order_change_1.previewOrderChangeStep)(input.order_id));
});
//# sourceMappingURL=order-edit-update-item-quantity.js.map