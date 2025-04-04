"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeExchangeShippingMethodWorkflow = exports.removeExchangeShippingMethodWorkflowId = exports.removeExchangeShippingMethodValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const delete_order_change_actions_1 = require("../../steps/delete-order-change-actions");
const preview_order_change_1 = require("../../steps/preview-order-change");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a shipping method can be removed from an exchange.
 * If the exchange is canceled, the order change is not active, the shipping method
 * doesn't exist, or the action isn't adding a shipping method, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order exchange and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeExchangeShippingMethodValidationStep({
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderExchange: {
 *     id: "exchange_123",
 *     // other order exchange details...
 *   },
 *   input: {
 *     exchange_id: "exchange_123",
 *     action_id: "orchact_123",
 *   }
 * })
 */
exports.removeExchangeShippingMethodValidationStep = (0, workflows_sdk_1.createStep)("validate-remove-exchange-shipping-method", async function ({ orderChange, orderExchange, input, }) {
    (0, order_validation_1.throwIfIsCancelled)(orderExchange, "Exchange");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
    const associatedAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
    if (!associatedAction) {
        throw new Error(`No shipping method found for exchange ${input.exchange_id} in order change ${orderChange.id}`);
    }
    else if (associatedAction.action !== utils_1.ChangeActionType.SHIPPING_ADD) {
        throw new Error(`Action ${associatedAction.id} is not adding a shipping method`);
    }
});
exports.removeExchangeShippingMethodWorkflowId = "remove-exchange-shipping-method";
/**
 * This workflow removes an inbound or outbound shipping method of an exchange. It's used by the
 * [Remove Inbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#exchanges_deleteexchangesidinboundshippingmethodaction_id) or
 * the [Remove Outbound Shipping Admin API Route](https://docs.medusajs.com/api/admin#exchanges_deleteexchangesidoutboundshippingmethodaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove an inbound or outbound shipping method
 * from an exchange in your custom flow.
 *
 * @example
 * const { result } = await removeExchangeShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     exchange_id: "exchange_123",
 *     action_id: "orchact_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an inbound or outbound shipping method from an exchange.
 */
exports.removeExchangeShippingMethodWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.removeExchangeShippingMethodWorkflowId, function (input) {
    const orderExchange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_exchange",
        fields: ["id", "status", "order_id", "canceled_at"],
        variables: { id: input.exchange_id },
        list: false,
        throw_if_key_not_found: true,
    });
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
    (0, exports.removeExchangeShippingMethodValidationStep)({
        orderExchange,
        orderChange,
        input,
    });
    const dataToRemove = (0, workflows_sdk_1.transform)({ orderChange, input }, ({ orderChange, input }) => {
        const associatedAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
        return {
            actionId: associatedAction.id,
            shippingMethodId: associatedAction.reference_id,
        };
    });
    (0, workflows_sdk_1.parallelize)((0, delete_order_change_actions_1.deleteOrderChangeActionsStep)({ ids: [dataToRemove.actionId] }), (0, steps_1.deleteOrderShippingMethods)({ ids: [dataToRemove.shippingMethodId] }));
    return new workflows_sdk_1.WorkflowResponse((0, preview_order_change_1.previewOrderChangeStep)(orderExchange.order_id));
});
//# sourceMappingURL=remove-exchange-shipping-method.js.map