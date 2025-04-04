"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderChangeActionsWorkflow = exports.createOrderChangeActionsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const create_entities_1 = require("../../common/steps/create-entities");
exports.createOrderChangeActionsWorkflowId = "create-order-change-actions";
/**
 * This workflow creates order change actions. It's used by other order-related workflows,
 * such as {@link requestItemReturnWorkflow} to create an order change action based on changes made to the order.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * creating an order change action.
 *
 * @summary
 *
 * Create an order change action.
 */
exports.createOrderChangeActionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createOrderChangeActionsWorkflowId, (input) => {
    const orderChangeActions = (0, create_entities_1.createEntitiesStep)({
        moduleRegistrationName: utils_1.Modules.ORDER,
        invokeMethod: "addOrderAction",
        compensateMethod: "deleteOrderChangeActions",
        data: input,
    });
    return new workflows_sdk_1.WorkflowResponse(orderChangeActions);
});
//# sourceMappingURL=create-order-change-actions.js.map