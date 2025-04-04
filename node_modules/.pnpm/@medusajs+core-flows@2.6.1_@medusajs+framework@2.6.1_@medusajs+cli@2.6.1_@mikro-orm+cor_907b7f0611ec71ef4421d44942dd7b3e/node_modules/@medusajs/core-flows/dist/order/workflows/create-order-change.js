"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderChangeWorkflow = exports.createOrderChangeWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createOrderChangeWorkflowId = "create-order-change";
/**
 * This workflow creates an order change.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * creating an order change.
 *
 * @summary
 *
 * Create an order change.
 */
exports.createOrderChangeWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createOrderChangeWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.createOrderChangeStep)(input));
});
//# sourceMappingURL=create-order-change.js.map