"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beginExchangeOrderWorkflow = exports.beginExchangeOrderWorkflowId = exports.beginOrderExchangeValidationStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const create_order_change_1 = require("../../steps/create-order-change");
const create_exchange_1 = require("../../steps/exchange/create-exchange");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that an exchange can be requested for an order.
 * If the order is canceled, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = beginOrderExchangeValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 * })
 */
exports.beginOrderExchangeValidationStep = (0, workflows_sdk_1.createStep)("begin-exchange-order-validation", async function ({ order }) {
    (0, order_validation_1.throwIfOrderIsCancelled)({ order });
});
exports.beginExchangeOrderWorkflowId = "begin-exchange-order";
/**
 * This workflow requests an order exchange. It's used by the
 * [Create Exchange Admin API Route](https://docs.medusajs.com/api/admin#exchanges_postexchanges).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to request an exchange
 * for an order in your custom flow.
 *
 * @example
 * const { result } = await beginExchangeOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Request an order exchange.
 */
exports.beginExchangeOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.beginExchangeOrderWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status"],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    });
    (0, exports.beginOrderExchangeValidationStep)({ order });
    const created = (0, create_exchange_1.createOrderExchangesStep)([
        {
            order_id: input.order_id,
            metadata: input.metadata,
            created_by: input.created_by,
        },
    ]);
    const orderChangeInput = (0, workflows_sdk_1.transform)({ created, input }, ({ created, input }) => {
        return {
            change_type: "exchange",
            order_id: input.order_id,
            exchange_id: created[0].id,
            created_by: input.created_by,
            description: input.description,
            internal_note: input.internal_note,
        };
    });
    return new workflows_sdk_1.WorkflowResponse((0, create_order_change_1.createOrderChangeStep)(orderChangeInput));
});
//# sourceMappingURL=begin-order-exchange.js.map