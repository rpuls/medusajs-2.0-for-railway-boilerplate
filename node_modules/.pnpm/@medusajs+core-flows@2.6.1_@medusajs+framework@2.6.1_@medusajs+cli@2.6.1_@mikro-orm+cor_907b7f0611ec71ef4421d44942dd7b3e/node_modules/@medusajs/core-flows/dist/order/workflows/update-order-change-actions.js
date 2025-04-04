"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderChangeActionsWorkflow = exports.updateOrderChangeActionsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updateOrderChangeActionsWorkflowId = "update-order-change-actions";
/**
 * This workflow updates one or more order change actions.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating order change actions.
 *
 * @summary
 *
 * Update one or more order change actions.
 */
exports.updateOrderChangeActionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateOrderChangeActionsWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.updateOrderChangeActionsStep)(input));
});
//# sourceMappingURL=update-order-change-actions.js.map