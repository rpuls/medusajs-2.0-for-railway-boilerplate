"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelOrderChangeWorkflow = exports.cancelOrderChangeWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.cancelOrderChangeWorkflowId = "cancel-order-change";
/**
 * This workflow cancels an order change.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * canceling an order change.
 *
 * @summary
 *
 * Cancel an order change.
 */
exports.cancelOrderChangeWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.cancelOrderChangeWorkflowId, (input) => {
    (0, steps_1.cancelOrderChangeStep)(input);
});
//# sourceMappingURL=cancel-order-change.js.map