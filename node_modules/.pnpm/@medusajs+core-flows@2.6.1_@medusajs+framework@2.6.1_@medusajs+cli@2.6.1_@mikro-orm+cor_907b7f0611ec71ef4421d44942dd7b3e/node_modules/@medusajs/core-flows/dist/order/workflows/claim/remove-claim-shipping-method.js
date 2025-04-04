"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeClaimShippingMethodWorkflow = exports.removeClaimShippingMethodWorkflowId = exports.removeClaimShippingMethodValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const delete_order_change_actions_1 = require("../../steps/delete-order-change-actions");
const preview_order_change_1 = require("../../steps/preview-order-change");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a claim's shipping method can be removed.
 * If the claim or order change is canceled, the shipping method doesn't
 * exist in the claim, or the action is not adding a shipping method, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order claim and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeClaimShippingMethodValidationStep({
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderClaim: {
 *     id: "claim_123",
 *     // other order claim details...
 *   },
 *   input: {
 *     claim_id: "claim_123",
 *     action_id: "orchact_123",
 *   }
 * })
 */
exports.removeClaimShippingMethodValidationStep = (0, workflows_sdk_1.createStep)("validate-remove-claim-shipping-method", async function ({ orderChange, orderClaim, input, }) {
    (0, order_validation_1.throwIfIsCancelled)(orderClaim, "Claim");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
    const associatedAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
    if (!associatedAction) {
        throw new Error(`No shipping method found for claim ${input.claim_id} in order change ${orderChange.id}`);
    }
    else if (associatedAction.action !== utils_1.ChangeActionType.SHIPPING_ADD) {
        throw new Error(`Action ${associatedAction.id} is not adding a shipping method`);
    }
});
exports.removeClaimShippingMethodWorkflowId = "remove-claim-shipping-method";
/**
 * This workflow removes an inbound (return) or outbound (delivery of new items) shipping method of a claim.
 * It's used by the [Remove Inbound Shipping Method](https://docs.medusajs.com/api/admin#claims_deleteclaimsidinboundshippingmethodaction_id),
 * or [Remove Outbound Shipping Method](https://docs.medusajs.com/api/admin#claims_deleteclaimsidoutboundshippingmethodaction_id) Admin API Routes.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to remove shipping methods from a claim
 * in your own custom flows.
 *
 * @example
 * const { result } = await removeClaimShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     claim_id: "claim_123",
 *     action_id: "orchact_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove an inbound or outbound shipping method from a claim.
 */
exports.removeClaimShippingMethodWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.removeClaimShippingMethodWorkflowId, function (input) {
    const orderClaim = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_claim",
        fields: ["id", "status", "order_id", "canceled_at"],
        variables: { id: input.claim_id },
        list: false,
        throw_if_key_not_found: true,
    });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status", "version", "actions.*"],
        variables: {
            filters: {
                order_id: orderClaim.order_id,
                claim_id: orderClaim.id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, exports.removeClaimShippingMethodValidationStep)({ orderClaim, orderChange, input });
    const dataToRemove = (0, workflows_sdk_1.transform)({ orderChange, input }, ({ orderChange, input }) => {
        const associatedAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
        return {
            actionId: associatedAction.id,
            shippingMethodId: associatedAction.reference_id,
        };
    });
    (0, workflows_sdk_1.parallelize)((0, delete_order_change_actions_1.deleteOrderChangeActionsStep)({ ids: [dataToRemove.actionId] }), (0, steps_1.deleteOrderShippingMethods)({ ids: [dataToRemove.shippingMethodId] }));
    return new workflows_sdk_1.WorkflowResponse((0, preview_order_change_1.previewOrderChangeStep)(orderClaim.order_id));
});
//# sourceMappingURL=remove-claim-shipping-method.js.map