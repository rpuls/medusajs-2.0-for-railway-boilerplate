"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.archiveOrderWorkflow = exports.archiveOrderWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.archiveOrderWorkflowId = "archive-order-workflow";
/**
 * This workflow archives one or more orders. It's used by the
 * [Archive Order Admin API Route](https://docs.medusajs.com/api/admin#orders_postordersidarchive).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around archiving orders.
 *
 * @example
 * const { result } = await archiveOrderWorkflow(container)
 * .run({
 *   input: {
 *     orderIds: ["order_123"]
 *   }
 * })
 *
 * @summary
 *
 * Archive one or more orders.
 */
exports.archiveOrderWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.archiveOrderWorkflowId, (input) => {
    const eventData = (0, workflows_sdk_1.transform)({ input }, (data) => {
        return data.input.orderIds.map((id) => ({ id }));
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.OrderWorkflowEvents.ARCHIVED,
        data: eventData,
    });
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.archiveOrdersStep)(input));
});
//# sourceMappingURL=archive-orders.js.map