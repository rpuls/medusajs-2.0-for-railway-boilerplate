"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmReturnReceiveWorkflow = exports.confirmReturnReceiveWorkflowId = exports.confirmReceiveReturnValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../../inventory/steps");
const steps_2 = require("../../steps");
const confirm_order_changes_1 = require("../../steps/confirm-order-changes");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a return receival can be confirmed.
 * If the order or return is canceled, or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, return, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = confirmReceiveReturnValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other order return details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   }
 * })
 */
exports.confirmReceiveReturnValidationStep = (0, workflows_sdk_1.createStep)("validate-confirm-return-receive", async function ({ order, orderChange, orderReturn, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfIsCancelled)(orderReturn, "Return");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
});
// Loop through the items in the return and prepare the inventory adjustment of items associated with each variant
function prepareInventoryUpdate({ orderReturn, returnedQuantityMap }) {
    const inventoryAdjustment = [];
    let hasManagedInventory = false;
    let hasStockLocation = false;
    const productVariantInventoryItems = new Map();
    // Create the map of inventory item ids associated with each variant that have inventory management
    (0, utils_1.deepFlatMap)(orderReturn.items, "item.variant.inventory_items.inventory.location_levels", ({ variant, inventory_items, location_levels }) => {
        if (!variant?.manage_inventory) {
            return;
        }
        hasManagedInventory = true;
        if (location_levels?.location_id !== orderReturn.location_id) {
            return;
        }
        hasStockLocation = true;
        if (!inventory_items) {
            return;
        }
        const inventoryItemId = inventory_items.inventory_item_id;
        if (!productVariantInventoryItems.has(inventoryItemId)) {
            productVariantInventoryItems.set(inventoryItemId, {
                variant_id: inventory_items.variant_id,
                inventory_item_id: inventoryItemId,
                required_quantity: inventory_items.required_quantity,
            });
        }
    });
    if (hasManagedInventory && !hasStockLocation) {
        throw new Error(`Cannot receive the Return at location ${orderReturn.location_id}`);
    }
    // Adjust the inventory of all inventory items of each variant in the return
    for (const [variantId, quantity] of Object.entries(returnedQuantityMap)) {
        const inventoryItemsByVariant = Array.from(productVariantInventoryItems.values()).filter((i) => i.variant_id === variantId);
        for (const inventoryItem of inventoryItemsByVariant) {
            inventoryAdjustment.push({
                inventory_item_id: inventoryItem.inventory_item_id,
                location_id: orderReturn.location_id,
                adjustment: utils_1.MathBN.mult(quantity, inventoryItem.required_quantity),
            });
        }
    }
    return inventoryAdjustment;
}
exports.confirmReturnReceiveWorkflowId = "confirm-return-receive";
/**
 * This workflow confirms a return receival request. It's used by the
 * [Confirm Return Receival Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsidreceiveconfirm).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to confirm a return receival in your custom flow.
 *
 * @example
 * const { result } = await confirmReturnReceiveWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *   }
 * })
 *
 * @summary
 *
 * Confirm a return receival request.
 */
exports.confirmReturnReceiveWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.confirmReturnReceiveWorkflowId, function (input) {
    const orderReturn = (0, common_1.useRemoteQueryStep)({
        entry_point: "return",
        fields: [
            "id",
            "status",
            "order_id",
            "location_id",
            "canceled_at",
            "items.*",
            "items.item.variant_id",
            "items.item.variant.manage_inventory",
            "items.item.variant.inventory_items.inventory_item_id",
            "items.item.variant.inventory_items.required_quantity",
            "items.item.variant.inventory_items.inventory.location_levels.location_id",
        ],
        variables: { id: input.return_id },
        list: false,
        throw_if_key_not_found: true,
    });
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "version", "canceled_at"],
        variables: { id: orderReturn.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: [
            "id",
            "status",
            "actions.id",
            "actions.action",
            "actions.details",
            "actions.reference",
            "actions.reference_id",
            "actions.internal_note",
        ],
        variables: {
            filters: {
                order_id: orderReturn.order_id,
                return_id: orderReturn.id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    const { updateReturnItem, returnedQuantityMap, updateReturn } = (0, workflows_sdk_1.transform)({ orderChange, orderReturn }, (data) => {
        const returnedQuantityMap = {};
        const retItems = data.orderReturn.items ?? [];
        const received = [];
        data.orderChange.actions.forEach((act) => {
            if ([
                utils_1.ChangeActionType.RECEIVE_RETURN_ITEM,
                utils_1.ChangeActionType.RECEIVE_DAMAGED_RETURN_ITEM,
            ].includes(act.action)) {
                received.push(act);
                if (act.action === utils_1.ChangeActionType.RECEIVE_RETURN_ITEM) {
                    const itemId = act.details.reference_id;
                    const variantId = retItems.find((i) => i.item_id === itemId)?.item?.variant_id;
                    if (!variantId) {
                        return;
                    }
                    const currentQuantity = returnedQuantityMap[variantId] ?? 0;
                    returnedQuantityMap[variantId] = utils_1.MathBN.add(currentQuantity, act.details.quantity);
                }
            }
        });
        const itemMap = retItems.reduce((acc, item) => {
            acc[item.item_id] = item.id;
            return acc;
        }, {});
        const itemUpdates = {};
        received.forEach((act) => {
            const itemId = act.details.reference_id;
            if (itemUpdates[itemId]) {
                itemUpdates[itemId].received_quantity = utils_1.MathBN.add(itemUpdates[itemId].received_quantity, act.details.quantity);
                if (act.action === utils_1.ChangeActionType.RECEIVE_DAMAGED_RETURN_ITEM) {
                    itemUpdates[itemId].damaged_quantity = utils_1.MathBN.add(itemUpdates[itemId].damaged_quantity, act.details.quantity);
                }
                return;
            }
            itemUpdates[itemId] = {
                id: itemMap[itemId],
                received_quantity: act.details.quantity,
                damaged_quantity: act.action === utils_1.ChangeActionType.RECEIVE_DAMAGED_RETURN_ITEM
                    ? act.details.quantity
                    : 0,
            };
        });
        const hasReceivedAllItems = retItems.every((item) => {
            const received = itemUpdates[item.item_id]
                ? itemUpdates[item.item_id].received_quantity
                : item.received_quantity;
            return utils_1.MathBN.eq(received, item.quantity);
        });
        const updateReturnData = hasReceivedAllItems
            ? { status: utils_1.ReturnStatus.RECEIVED, received_at: new Date() }
            : { status: utils_1.ReturnStatus.PARTIALLY_RECEIVED };
        const updateReturn = {
            id: data.orderReturn.id,
            ...updateReturnData,
        };
        return {
            updateReturnItem: Object.values(itemUpdates),
            returnedQuantityMap,
            updateReturn,
        };
    });
    const inventoryAdjustment = (0, workflows_sdk_1.transform)({ orderReturn, input, returnedQuantityMap }, prepareInventoryUpdate);
    (0, exports.confirmReceiveReturnValidationStep)({ order, orderReturn, orderChange });
    (0, workflows_sdk_1.parallelize)((0, steps_2.updateReturnsStep)([updateReturn]), (0, steps_2.updateReturnItemsStep)(updateReturnItem), (0, confirm_order_changes_1.confirmOrderChanges)({
        changes: [orderChange],
        orderId: order.id,
        confirmed_by: input.confirmed_by,
    }), (0, steps_1.adjustInventoryLevelsStep)(inventoryAdjustment), (0, common_1.emitEventStep)({
        eventName: utils_1.OrderWorkflowEvents.RETURN_RECEIVED,
        data: {
            order_id: order.id,
            return_id: orderReturn.id,
        },
    }));
    return new workflows_sdk_1.WorkflowResponse((0, steps_2.previewOrderChangeStep)(order.id));
});
//# sourceMappingURL=confirm-receive-return-request.js.map