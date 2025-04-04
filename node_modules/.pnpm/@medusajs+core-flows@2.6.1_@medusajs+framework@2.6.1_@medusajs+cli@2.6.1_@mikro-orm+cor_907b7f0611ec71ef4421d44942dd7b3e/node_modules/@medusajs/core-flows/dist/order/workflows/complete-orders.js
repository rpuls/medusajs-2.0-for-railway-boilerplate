"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeOrderWorkflow = exports.completeOrderWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.completeOrderWorkflowId = "complete-order-workflow";
/**
 * This workflow marks one or more orders as completed. It's used by the [Complete Cart Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidcomplete).
 *
 * This workflow has a hook that allows you to perform custom actions on the completed orders. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the orders.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around order completion.
 *
 * @example
 * const { result } = await completeOrderWorkflow(container)
 * .run({
 *   input: {
 *     orderIds: ["order_1", "order_2"],
 *     additional_data: {
 *       send_webhook: true,
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Complete one or more orders.
 *
 * @property hooks.ordersCompleted - This hook is executed after the orders are completed. You can consume this hook to perform custom actions on the completed orders.
 */
exports.completeOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.completeOrderWorkflowId, (input) => {
    const completedOrders = (0, steps_1.completeOrdersStep)(input);
    const eventData = (0, workflows_sdk_1.transform)({ input }, (data) => {
        return data.input.orderIds.map((id) => ({ id }));
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.OrderWorkflowEvents.COMPLETED,
        data: eventData,
    });
    const ordersCompleted = (0, workflows_sdk_1.createHook)("ordersCompleted", {
        orders: completedOrders,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(completedOrders, {
        hooks: [ordersCompleted],
    });
});
//# sourceMappingURL=complete-orders.js.map