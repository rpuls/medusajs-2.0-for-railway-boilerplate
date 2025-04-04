"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.declineOrderTransferRequestWorkflow = exports.declineTransferOrderRequestWorkflowId = exports.declineTransferOrderRequestValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a requested order transfer can be declineed.
 * If the provided token doesn't match the token of the transfer request,
 * the step throws an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = declineTransferOrderRequestValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "order_change_123",
 *     // other order change details...
 *   },
 *   input: {
 *     token: "token_123",
 *     order_id: "order_123",
 *   }
 * })
 */
exports.declineTransferOrderRequestValidationStep = (0, workflows_sdk_1.createStep)("validate-decline-transfer-order-request", async function ({ order, orderChange, input, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
    const token = orderChange.actions?.find((a) => a.action === utils_1.ChangeActionType.TRANSFER_CUSTOMER)?.details.token;
    if (!input.token?.length || token !== input.token) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Invalid token.");
    }
});
exports.declineTransferOrderRequestWorkflowId = "decline-transfer-order-request";
/**
 * This workflow declines a requested order transfer by its token. It's used by the
 * [Decline Order Transfer Store API Route](https://docs.medusajs.com/api/store#orders_postordersidtransferdecline).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around declining an order transfer request.
 *
 * @example
 * const { result } = await declineOrderTransferRequestWorkflow(container)
 * .run({
 *   input: {
 *     token: "token_123",
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Decline a requested order transfer.
 */
exports.declineOrderTransferRequestWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.declineTransferOrderRequestWorkflowId, function (input) {
    const orderQuery = (0, common_1.useQueryGraphStep)({
        entity: "order",
        fields: ["id", "version", "declineed_at"],
        filters: { id: input.order_id },
        options: { throwIfKeyNotFound: true },
    }).config({ name: "order-query" });
    const order = (0, workflows_sdk_1.transform)({ orderQuery }, ({ orderQuery }) => orderQuery.data[0]);
    const orderChangeQuery = (0, common_1.useQueryGraphStep)({
        entity: "order_change",
        fields: ["id", "status", "version", "actions.*"],
        filters: {
            order_id: input.order_id,
            status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
        },
    }).config({ name: "order-change-query" });
    const orderChange = (0, workflows_sdk_1.transform)({ orderChangeQuery }, ({ orderChangeQuery }) => orderChangeQuery.data[0]);
    (0, exports.declineTransferOrderRequestValidationStep)({ order, orderChange, input });
    (0, steps_1.declineOrderChangeStep)({ id: orderChange.id });
});
//# sourceMappingURL=decline-order-transfer.js.map