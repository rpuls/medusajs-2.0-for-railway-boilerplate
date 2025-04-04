"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderChangeActionsWorkflow = exports.deleteOrderChangeActionsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.deleteOrderChangeActionsWorkflowId = "delete-order-change-actions";
/**
 * This workflow deletes one or more order change actions.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * deleting an order change action.
 *
 * @summary
 *
 * Delete one or more order change actions.
 */
exports.deleteOrderChangeActionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteOrderChangeActionsWorkflowId, (input) => {
    (0, steps_1.deleteOrderChangeActionsStep)(input);
});
//# sourceMappingURL=delete-order-change-actions.js.map