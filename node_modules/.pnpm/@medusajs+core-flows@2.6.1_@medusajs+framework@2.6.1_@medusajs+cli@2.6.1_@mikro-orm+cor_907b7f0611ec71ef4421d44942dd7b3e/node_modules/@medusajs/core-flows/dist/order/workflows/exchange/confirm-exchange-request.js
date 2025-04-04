"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmExchangeRequestWorkflow = exports.confirmExchangeRequestWorkflowId = exports.confirmExchangeRequestValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const reserve_inventory_1 = require("../../../cart/steps/reserve-inventory");
const prepare_confirm_inventory_input_1 = require("../../../cart/utils/prepare-confirm-inventory-input");
const common_1 = require("../../../common");
const create_return_fulfillment_1 = require("../../../fulfillment/workflows/create-return-fulfillment");
const steps_1 = require("../../steps");
const confirm_order_changes_1 = require("../../steps/confirm-order-changes");
const create_exchange_items_from_actions_1 = require("../../steps/exchange/create-exchange-items-from-actions");
const create_return_items_from_actions_1 = require("../../steps/return/create-return-items-from-actions");
const order_validation_1 = require("../../utils/order-validation");
const create_or_update_order_payment_collection_1 = require("../create-or-update-order-payment-collection");
/**
 * This step validates that a requested exchange can be confirmed.
 * If the order or exchange is canceled, or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order exchange, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = confirmExchangeRequestValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderExchange: {
 *     id: "exchange_123",
 *     // other order exchange details...
 *   },
 * })
 */
exports.confirmExchangeRequestValidationStep = (0, workflows_sdk_1.createStep)("validate-confirm-exchange-request", async function ({ order, orderChange, orderExchange, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfIsCancelled)(orderExchange, "Exchange");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
});
/**
 * This step confirms that a requested exchange has at least one item to return or send
 */
const confirmIfExchangeItemsArePresent = (0, workflows_sdk_1.createStep)("confirm-if-exchange-items-are-present", async function ({ exchangeItems, returnItems, }) {
    if (exchangeItems.length > 0 && (returnItems || []).length > 0) {
        return;
    }
    throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Order exchange request should have at least 1 item inbound and 1 item outbound`);
});
function prepareFulfillmentData({ order, items, shippingOption, deliveryAddress, }) {
    const orderItemsMap = new Map(order.items.map((i) => [i.id, i]));
    const fulfillmentItems = items.map((i) => {
        const orderItem = orderItemsMap.get(i.id) ?? i.item;
        return {
            line_item_id: i.item_id,
            quantity: i.quantity,
            title: orderItem.variant_title ?? orderItem.title,
            sku: orderItem.variant_sku || "",
            barcode: orderItem.variant_barcode || "",
        };
    });
    const locationId = shippingOption.service_zone.fulfillment_set.location?.id;
    // delivery address is the stock location address
    const address = deliveryAddress ??
        shippingOption.service_zone.fulfillment_set.location?.address ??
        {};
    delete address.id;
    return {
        input: {
            location_id: locationId,
            provider_id: shippingOption.provider_id,
            shipping_option_id: shippingOption.id,
            items: fulfillmentItems,
            delivery_address: address,
            order: order,
        },
    };
}
function transformActionsToItems({ orderChange }) {
    const exchangeItems = [];
    const returnItems = [];
    const actions = orderChange.actions ?? [];
    actions.forEach((item) => {
        if (item.action === utils_1.ChangeActionType.RETURN_ITEM) {
            returnItems.push(item);
        }
        else if (item.action === utils_1.ChangeActionType.ITEM_ADD) {
            exchangeItems.push(item);
        }
    });
    return {
        exchangeItems: {
            changes: exchangeItems,
            exchangeId: exchangeItems?.[0]?.exchange_id,
        },
        returnItems: {
            changes: returnItems,
            returnId: returnItems?.[0]?.return_id,
        },
    };
}
function extractShippingOption({ orderPreview, orderExchange, returnId }) {
    if (!orderPreview.shipping_methods?.length) {
        return;
    }
    let returnShippingMethod;
    let exchangeShippingMethod;
    for (const shippingMethod of orderPreview.shipping_methods) {
        const modifiedShippingMethod_ = shippingMethod;
        if (!modifiedShippingMethod_.actions) {
            continue;
        }
        for (const action of modifiedShippingMethod_.actions) {
            if (action.action === utils_1.ChangeActionType.SHIPPING_ADD) {
                if (action.return_id === returnId) {
                    returnShippingMethod = shippingMethod;
                }
                else if (action.exchange_id === orderExchange.id) {
                    exchangeShippingMethod = shippingMethod;
                }
            }
        }
    }
    return {
        returnShippingMethod,
        exchangeShippingMethod,
    };
}
function getUpdateReturnData({ returnId }) {
    return (0, workflows_sdk_1.transform)({ returnId }, ({ returnId }) => {
        return [
            {
                id: returnId,
                status: utils_1.ReturnStatus.REQUESTED,
                requested_at: new Date(),
            },
        ];
    });
}
exports.confirmExchangeRequestWorkflowId = "confirm-exchange-request";
/**
 * This workflow confirms an exchange request. It's used by the
 * [Confirm Exchange Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchangesidrequest).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to confirm an exchange
 * for an order in your custom flow.
 *
 * @example
 * const { result } = await confirmExchangeRequestWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *   }
 * })
 *
 * @summary
 *
 * Confirm an exchange request.
 */
exports.confirmExchangeRequestWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.confirmExchangeRequestWorkflowId, function (input) {
    const orderExchange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_exchange",
        fields: ["id", "status", "order_id", "canceled_at"],
        variables: { id: input.exchange_id },
        list: false,
        throw_if_key_not_found: true,
    });
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: [
            "id",
            "version",
            "canceled_at",
            "items.*",
            "items.item.id",
            "shipping_address.*",
        ],
        variables: { id: orderExchange.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: [
            "id",
            "status",
            "actions.id",
            "actions.exchange_id",
            "actions.return_id",
            "actions.action",
            "actions.details",
            "actions.reference",
            "actions.reference_id",
            "actions.internal_note",
        ],
        variables: {
            filters: {
                order_id: orderExchange.order_id,
                exchange_id: orderExchange.id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, exports.confirmExchangeRequestValidationStep)({ order, orderExchange, orderChange });
    const { exchangeItems, returnItems } = (0, workflows_sdk_1.transform)({ orderChange }, transformActionsToItems);
    const orderPreview = (0, steps_1.previewOrderChangeStep)(order.id);
    const [createdExchangeItems, createdReturnItems] = (0, workflows_sdk_1.parallelize)((0, create_exchange_items_from_actions_1.createOrderExchangeItemsFromActionsStep)(exchangeItems), (0, create_return_items_from_actions_1.createReturnItemsFromActionsStep)(returnItems));
    confirmIfExchangeItemsArePresent({
        exchangeItems: createdExchangeItems,
        returnItems: createdReturnItems,
    });
    (0, confirm_order_changes_1.confirmOrderChanges)({
        changes: [orderChange],
        orderId: order.id,
        confirmed_by: input.confirmed_by,
    });
    const returnId = (0, workflows_sdk_1.transform)({ createdReturnItems }, ({ createdReturnItems }) => {
        return createdReturnItems?.[0]?.return_id;
    });
    (0, workflows_sdk_1.when)({ returnId }, ({ returnId }) => {
        return !!returnId;
    }).then(() => {
        const updateReturnData = getUpdateReturnData({ returnId });
        (0, steps_1.updateReturnsStep)(updateReturnData);
    });
    const { returnShippingMethod, exchangeShippingMethod } = (0, workflows_sdk_1.transform)({ orderPreview, orderExchange, returnId }, extractShippingOption);
    (0, workflows_sdk_1.when)({ exchangeShippingMethod }, ({ exchangeShippingMethod }) => {
        return !!exchangeShippingMethod;
    }).then(() => {
        const exchange = (0, common_1.useRemoteQueryStep)({
            entry_point: "order_exchange",
            fields: [
                "id",
                "version",
                "canceled_at",
                "order.sales_channel_id",
                "additional_items.quantity",
                "additional_items.raw_quantity",
                "additional_items.item.id",
                "additional_items.item.variant.manage_inventory",
                "additional_items.item.variant.allow_backorder",
                "additional_items.item.variant.inventory_items.inventory_item_id",
                "additional_items.item.variant.inventory_items.required_quantity",
                "additional_items.item.variant.inventory_items.inventory.location_levels.stock_locations.id",
                "additional_items.item.variant.inventory_items.inventory.location_levels.stock_locations.name",
                "additional_items.item.variant.inventory_items.inventory.location_levels.stock_locations.sales_channels.id",
                "additional_items.item.variant.inventory_items.inventory.location_levels.stock_locations.sales_channels.name",
            ],
            variables: { id: input.exchange_id },
            list: false,
            throw_if_key_not_found: true,
        }).config({ name: "exchange-query" });
        const { variants, items } = (0, workflows_sdk_1.transform)({ exchange }, ({ exchange }) => {
            const allItems = [];
            const allVariants = [];
            exchange.additional_items.forEach((exchangeItem) => {
                const item = exchangeItem.item;
                allItems.push({
                    id: item.id,
                    variant_id: item.variant_id,
                    quantity: exchangeItem.raw_quantity ?? exchangeItem.quantity,
                });
                allVariants.push(item.variant);
            });
            return {
                variants: allVariants,
                items: allItems,
            };
        });
        const formatedInventoryItems = (0, workflows_sdk_1.transform)({
            input: {
                sales_channel_id: exchange.order.sales_channel_id,
                variants,
                items,
            },
        }, prepare_confirm_inventory_input_1.prepareConfirmInventoryInput);
        (0, reserve_inventory_1.reserveInventoryStep)(formatedInventoryItems);
    });
    (0, workflows_sdk_1.when)({ returnShippingMethod, returnId }, ({ returnShippingMethod, returnId }) => {
        return !!returnShippingMethod && !!returnId;
    }).then(() => {
        const returnShippingOption = (0, common_1.useRemoteQueryStep)({
            entry_point: "shipping_options",
            fields: [
                "id",
                "provider_id",
                "service_zone.fulfillment_set.location.id",
                "service_zone.fulfillment_set.location.address.*",
            ],
            variables: {
                id: returnShippingMethod.shipping_option_id,
            },
            list: false,
        }).config({ name: "exchange-return-shipping-option" });
        const fulfillmentData = (0, workflows_sdk_1.transform)({
            order,
            items: order.items,
            shippingOption: returnShippingOption,
        }, prepareFulfillmentData);
        const returnFulfillment = create_return_fulfillment_1.createReturnFulfillmentWorkflow.runAsStep(fulfillmentData);
        const returnLink = (0, workflows_sdk_1.transform)({ returnId, fulfillment: returnFulfillment }, (data) => {
            return [
                {
                    [utils_1.Modules.ORDER]: { return_id: data.returnId },
                    [utils_1.Modules.FULFILLMENT]: { fulfillment_id: data.fulfillment.id },
                },
            ];
        });
        (0, common_1.createRemoteLinkStep)(returnLink).config({
            name: "exchange-return-shipping-fulfillment-link",
        });
    });
    create_or_update_order_payment_collection_1.createOrUpdateOrderPaymentCollectionWorkflow.runAsStep({
        input: {
            order_id: order.id,
        },
    });
    (0, common_1.emitEventStep)({
        eventName: utils_1.OrderWorkflowEvents.EXCHANGE_CREATED,
        data: {
            order_id: order.id,
            exchange_id: orderExchange.id,
        },
    });
    return new workflows_sdk_1.WorkflowResponse(orderPreview);
});
//# sourceMappingURL=confirm-exchange-request.js.map