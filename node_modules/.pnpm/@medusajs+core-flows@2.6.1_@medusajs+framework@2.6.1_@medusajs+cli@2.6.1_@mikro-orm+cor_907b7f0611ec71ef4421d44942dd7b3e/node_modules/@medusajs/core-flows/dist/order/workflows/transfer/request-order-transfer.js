"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOrderTransferWorkflow = exports.requestOrderTransferWorkflowId = exports.requestOrderTransferValidationStep = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const uuid_1 = require("uuid");
const common_1 = require("../../../common");
const create_order_change_1 = require("../../steps/create-order-change");
const order_validation_1 = require("../../utils/order-validation");
const create_order_change_actions_1 = require("../create-order-change-actions");
const utils_1 = require("@medusajs/utils");
const steps_1 = require("../../steps");
/**
 * This step validates that an order transfer can be requested. If the customer
 * is a guest customer, or the order already belongs to a registered customer,
 * the step throws an error.
 *
 * :::note
 *
 * You can retrieve an order and customer details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = requestOrderTransferValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   customer: {
 *     id: "customer_123",
 *     // other customer details...
 *   }
 * })
 */
exports.requestOrderTransferValidationStep = (0, workflows_sdk_1.createStep)("request-order-transfer-validation", async function ({ order, customer, }) {
    (0, order_validation_1.throwIfOrderIsCancelled)({ order });
    if (!customer.has_account) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot transfer order: ${order.id} to a guest customer account: ${customer.email}`);
    }
    if (order.customer_id === customer.id) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Order: ${order.id} already belongs to customer: ${customer.id}`);
    }
});
exports.requestOrderTransferWorkflowId = "request-order-transfer-workflow";
/**
 * This workflow requests an order transfer from a guest customer to a registered customer. It can be requested by an admin user or a customer.
 * If a customer requested the transfer, the `logged_in_user` input property should be the same as the customer's ID.
 *
 * This workflow is used by the [Request Order Transfer Store API Route](https://docs.medusajs.com/api/store#orders_postordersidtransferrequest),
 * and the [Request Order Transfer Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidtransfer).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to build a custom flow around requesting an order transfer.
 *
 * @example
 * const { result } = await requestOrderTransferWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     customer_id: "customer_123",
 *     logged_in_user: "user_123",
 *   }
 * })
 *
 * @summary
 *
 * Request a transfer of an order to a customer.
 */
exports.requestOrderTransferWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.requestOrderTransferWorkflowId, function (input) {
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "email", "status", "customer_id"],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    });
    const customer = (0, common_1.useRemoteQueryStep)({
        entry_point: "customers",
        fields: ["id", "email", "has_account"],
        variables: { id: input.customer_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "customer-query" });
    (0, exports.requestOrderTransferValidationStep)({ order, customer });
    const orderChangeInput = (0, workflows_sdk_1.transform)({ input }, ({ input }) => {
        return {
            change_type: "transfer",
            order_id: input.order_id,
            created_by: input.logged_in_user,
            description: input.description,
            internal_note: input.internal_note,
        };
    });
    const change = (0, create_order_change_1.createOrderChangeStep)(orderChangeInput);
    const actionInput = (0, workflows_sdk_1.transform)({ order, input, change }, ({ order, input, change }) => [
        {
            order_change_id: change.id,
            order_id: input.order_id,
            action: utils_1.ChangeActionType.TRANSFER_CUSTOMER,
            version: change.version,
            reference: "customer",
            reference_id: input.customer_id,
            details: {
                token: (0, uuid_1.v4)(),
                original_email: order.email,
            },
        },
    ]);
    create_order_change_actions_1.createOrderChangeActionsWorkflow.runAsStep({
        input: actionInput,
    });
    const updateOrderChangeInput = (0, workflows_sdk_1.transform)({ input, change }, ({ input, change }) => [
        {
            id: change.id,
            status: utils_1.OrderChangeStatus.REQUESTED,
            requested_by: input.logged_in_user,
            requested_at: new Date(),
        },
    ]);
    (0, steps_1.updateOrderChangesStep)(updateOrderChangeInput);
    (0, common_1.emitEventStep)({
        eventName: utils_1.OrderWorkflowEvents.TRANSFER_REQUESTED,
        data: { id: input.order_id, order_change_id: change.id },
    });
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.previewOrderChangeStep)(input.order_id));
});
//# sourceMappingURL=request-order-transfer.js.map