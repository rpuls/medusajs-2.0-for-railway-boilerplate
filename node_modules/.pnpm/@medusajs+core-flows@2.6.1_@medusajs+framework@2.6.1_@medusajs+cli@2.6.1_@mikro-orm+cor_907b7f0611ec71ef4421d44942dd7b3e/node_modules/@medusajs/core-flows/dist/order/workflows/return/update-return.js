"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReturnWorkflow = exports.updateReturnWorkflowId = exports.updateReturnValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const steps_1 = require("../../steps");
const preview_order_change_1 = require("../../steps/preview-order-change");
const order_validation_1 = require("../../utils/order-validation");
/**
 * This step validates that a return can be updated.
 * If the return is canceled or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve a return and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = updateReturnValidationStep({
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   orderReturn: {
 *     id: "return_123",
 *     // other return details...
 *   },
 * })
 */
exports.updateReturnValidationStep = (0, workflows_sdk_1.createStep)("validate-update-return", async function ({ orderChange, orderReturn, }) {
    (0, order_validation_1.throwIfIsCancelled)(orderReturn, "Return");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
});
exports.updateReturnWorkflowId = "update-return";
/**
 * This workflow updates a return's details. It's used by the
 * [Update Return Admin API Route](https://docs.medusajs.com/api/admin#returns_postreturnsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you
 * to update a return in your custom flow.
 *
 * @example
 * const { result } = await updateReturnWorkflow(container)
 * .run({
 *   input: {
 *     return_id: "return_123",
 *     no_notification: true
 *   }
 * })
 *
 * @summary
 *
 * Update a return's details.
 */
exports.updateReturnWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateReturnWorkflowId, function (input) {
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
    (0, exports.updateReturnValidationStep)({ orderReturn, orderChange });
    const updateData = (0, workflows_sdk_1.transform)({ input }, ({ input }) => {
        return {
            id: input.return_id,
            location_id: input.location_id,
            no_notification: input.no_notification,
            metadata: input.metadata,
        };
    });
    (0, steps_1.updateReturnsStep)([updateData]);
    return new workflows_sdk_1.WorkflowResponse((0, preview_order_change_1.previewOrderChangeStep)(orderReturn.order_id));
});
//# sourceMappingURL=update-return.js.map