"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBeginOrderExchangeWorkflow = exports.cancelBeginOrderExchangeWorkflowId = exports.cancelBeginOrderExchangeValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a requested exchange can be canceled.
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
 * const data = cancelBeginOrderExchangeValidationStep({
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
exports.cancelBeginOrderExchangeValidationStep = (0, workflows_sdk_1.createStep)("validate-cancel-begin-order-exchange", async function ({ order, orderChange, orderExchange, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfIsCancelled)(orderExchange, "Exchange");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
});
exports.cancelBeginOrderExchangeWorkflowId = "cancel-begin-order-exchange";
/**
 * This workflow cancels a requested order exchange. It's used by the
 * [Cancel Exchange Admin API Route](https://docs.medusajs.com/api/admin#exchanges_deleteexchangesidrequest).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to cancel an exchange
 * for an order in your custom flow.
 *
 * @example
 * const { result } = await cancelBeginOrderExchangeWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *   }
 * })
 *
 * @summary
 *
 * Cancel a requested order exchange.
 */
exports.cancelBeginOrderExchangeWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.cancelBeginOrderExchangeWorkflowId, function (input) {
    const orderExchange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_exchange",
        fields: ["id", "status", "order_id", "return_id", "canceled_at"],
        variables: { id: input.exchange_id },
        list: false,
        throw_if_key_not_found: true,
    });
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "version", "canceled_at"],
        variables: { id: orderExchange.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status", "version", "actions.*"],
        variables: {
            filters: {
                order_id: orderExchange.order_id,
                exchange_id: orderExchange.id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, exports.cancelBeginOrderExchangeValidationStep)({
        order,
        orderExchange,
        orderChange,
    });
    const shippingToRemove = (0, workflows_sdk_1.transform)({ orderChange, input }, ({ orderChange, input }) => {
        return (orderChange.actions ?? [])
            .filter((a) => a.action === utils_1.ChangeActionType.SHIPPING_ADD)
            .map(({ id }) => id);
    });
    (0, workflows_sdk_1.parallelize)((0, steps_1.deleteReturnsStep)({ ids: [orderExchange.return_id] }), (0, steps_1.deleteExchangesStep)({ ids: [orderExchange.id] }), (0, steps_1.deleteOrderChangesStep)({ ids: [orderChange.id] }), (0, steps_1.deleteOrderShippingMethods)({ ids: shippingToRemove }));
});
//# sourceMappingURL=cancel-begin-order-exchange.js.map