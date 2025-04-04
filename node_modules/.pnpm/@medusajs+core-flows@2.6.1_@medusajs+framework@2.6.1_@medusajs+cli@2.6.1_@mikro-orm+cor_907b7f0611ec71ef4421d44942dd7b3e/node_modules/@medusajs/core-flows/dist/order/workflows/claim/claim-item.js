"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderClaimItemWorkflow = exports.orderClaimItemWorkflowId = exports.orderClaimItemValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const preview_order_change_1 = require("../../steps/preview-order-change");
const order_validation_1 = require("../../utils/order-validation");
const create_order_change_actions_1 = require("../create-order-change-actions");
/**
 * This step validates that claim items can be added to a claim. If the
 * order or claim is canceled, or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order, order claim, and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = orderClaimItemValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderClaim: {
 *     id: "claim_123",
 *     // other order claim details...
 *   }
 * })
 */
exports.orderClaimItemValidationStep = (0, workflows_sdk_1.createStep)("claim-item-validation", async function ({ order, orderChange, orderClaim, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfIsCancelled)(orderClaim, "Claim");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
});
exports.orderClaimItemWorkflowId = "claim-item";
/**
 * This workflow adds order items to a claim as claim items. It's used by the
 * [Add Claim Items Admin API Route](https://docs.medusajs.com/api/admin#claims_postclaimsidclaimitems).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to add items to a claim
 * for an order in your custom flows.
 *
 * @example
 * const { result } = await orderClaimItemWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     items: [
 *       {
 *         id: "orli_123",
 *         quantity: 1
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Add order items to a claim as claim items.
 */
exports.orderClaimItemWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.orderClaimItemWorkflowId, function (input) {
    const orderClaim = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_claim",
        fields: ["id", "order_id", "canceled_at"],
        variables: { id: input.claim_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "claim-query" });
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: ["id", "status", "canceled_at", "items.*"],
        variables: { id: orderClaim.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status"],
        variables: {
            filters: {
                order_id: orderClaim.order_id,
                claim_id: orderClaim.id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, exports.orderClaimItemValidationStep)({
        order,
        orderClaim,
        orderChange,
    });
    const orderChangeActionInput = (0, workflows_sdk_1.transform)({ order, orderChange, orderClaim, items: input.items }, ({ order, orderChange, orderClaim, items }) => {
        return items.map((item, index) => ({
            order_change_id: orderChange.id,
            order_id: order.id,
            claim_id: orderClaim.id,
            version: orderChange.version,
            action: utils_1.ChangeActionType.WRITE_OFF_ITEM,
            internal_note: item.internal_note,
            reference: "order_claim",
            reference_id: orderClaim.id,
            details: {
                reference_id: item.id,
                reason: item.reason,
                quantity: item.quantity,
            },
        }));
    });
    create_order_change_actions_1.createOrderChangeActionsWorkflow.runAsStep({
        input: orderChangeActionInput,
    });
    return new workflows_sdk_1.WorkflowResponse((0, preview_order_change_1.previewOrderChangeStep)(orderClaim.order_id));
});
//# sourceMappingURL=claim-item.js.map