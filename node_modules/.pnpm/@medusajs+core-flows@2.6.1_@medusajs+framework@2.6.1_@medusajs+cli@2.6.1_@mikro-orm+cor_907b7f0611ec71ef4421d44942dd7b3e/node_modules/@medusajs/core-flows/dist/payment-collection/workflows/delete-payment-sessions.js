"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentSessionsWorkflow = exports.deletePaymentSessionsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.deletePaymentSessionsWorkflowId = "delete-payment-sessions";
/**
 * This workflow deletes one or more payment sessions. It's used by other workflows, like
 * {@link refreshPaymentCollectionForCartWorkflow} to delete payment sessions when the cart's total changes.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete payment sessions in your custom flows.
 *
 * @example
 * const { result } = await deletePaymentSessionsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["payses_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete payment sessions.
 */
exports.deletePaymentSessionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deletePaymentSessionsWorkflowId, (input) => {
    const idsDeleted = (0, steps_1.deletePaymentSessionsStep)({ ids: input.ids });
    (0, steps_1.validateDeletedPaymentSessionsStep)({
        idsToDelete: input.ids,
        idsDeleted,
    });
    return new workflows_sdk_1.WorkflowResponse(idsDeleted);
});
//# sourceMappingURL=delete-payment-sessions.js.map