"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderChangesWorkflow = exports.updateOrderChangesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updateOrderChangesWorkflowId = "update-order-change";
/**
 * This workflow updates one or more order changes.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating order changes.
 *
 * @summary
 *
 * Update one or more order changes.
 */
exports.updateOrderChangesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateOrderChangesWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.updateOrderChangesStep)(input));
});
//# sourceMappingURL=update-order-changes.js.map