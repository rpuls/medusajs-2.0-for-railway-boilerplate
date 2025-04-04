"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeReturnShippingMethodWorkflow = exports.removeReturnShippingMethodWorkflowId = exports.removeReturnShippingMethodValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const delete_order_change_actions_1 = require("../../steps/delete-order-change-actions");
const preview_order_change_1 = require("../../steps/preview-order-change");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a shipping method can be removed from a return.
 * If the return is canceled, the order change is not active,
 * the shipping method isn't in the return,
 * or the action doesn't add a shipping method, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve a return and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = removeReturnShippingMethodValidationStep({
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other return details...
 *   },
 *   input: {
 *     return_id: "return_123",
 *     action_id: "orchac_123",
 *   }
 * })
 */
exports.removeReturnShippingMethodValidationStep = (0, workflows_sdk_1.createStep)("validate-remove-return-shipping-method", async function ({ orderChange, orderReturn, input, }) {
    (0, order_validation_1.throwIfIsCancelled)(orderReturn, "Return");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
    const associatedAction = (orderChange.actions ?? []).find((a) => a.id === input.action_id);
    if (!associatedAction) {
        throw new Error(`No shipping method found for return ${input.return_id} in order change ${orderChange.id}`);
    }
    else if (associatedAction.action !== utils_1.ChangeActionType.SHIPPING_ADD) {
        throw new Error(`Action ${associatedAction.id} is not adding a shipping method`);
    }
});
exports.removeReturnShippingMethodWorkflowId = "remove-return-shipping-method";
/**
 * This workflow removes a shipping method from a return. It's used by the
 * [Remove Shipping Method from Return Admin API Route](https://docs.medusajs.com/api/admin#returns_deletereturnsidshippingmethodaction_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to remove a shipping method from a return in your custom flows.
 *
 * @example
 * const { result } = await removeReturnShippingMethodWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     action_id: "orchac_123",
 *   }
 * })
 *
 * @summary
 *
 * Remove a shipping method from a return.
 */
exports.removeReturnShippingMethodWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.removeReturnShippingMethodWorkflowId, function (input) {
    const orderReturn = (0, common_1.useRemoteQueryStep)({
        entry_point: "return",
        fields: ["id", "status", "order_id", "canceled_at"],
        variables: { id: input.return_id },
        list: false,
        throw_if_key_not_found: true,
    });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: ["id", "status", "version", "actions.*"],
        variables: {
            filters: {
                order_id: orderReturn.order_id,
                return_id: orderReturn.id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, exports.removeReturnShippingMethodValidationStep)({
        orderReturn,
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
    return new workflows_sdk_1.WorkflowResponse((0, preview_order_change_1.previewOrderChangeStep)(orderReturn.order_id));
});
//# sourceMappingURL=remove-return-shipping-method.js.map