"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShipmentWorkflow = exports.createShipmentWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
const update_fulfillment_1 = require("./update-fulfillment");
exports.createShipmentWorkflowId = "create-shipment-workflow";
/**
 * This workflow creates shipments for a fulfillment. It's used by the
 * [Create Shipment Admin API Route](https://docs.medusajs.com/api/admin#fulfillments_postfulfillmentsidshipment).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * create shipments within your custom flows.
 *
 * @example
 * const { result } = await createShipmentWorkflow(container)
 * .run({
 *   input: {
 *     id: "ful_123",
 *     labels: [
 *       {
 *         tracking_url: "https://example.com",
 *         tracking_number: "123",
 *         label_url: "https://example.com"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create a shipment for a fulfillment.
 */
exports.createShipmentWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createShipmentWorkflowId, (input) => {
    (0, steps_1.validateShipmentStep)(input.id);
    const update = (0, workflows_sdk_1.transform)({ input }, (data) => ({
        ...data.input,
        shipped_at: new Date(),
    }));
    return new workflows_sdk_1.WorkflowResponse(update_fulfillment_1.updateFulfillmentWorkflow.runAsStep({
        input: update,
    }));
});
//# sourceMappingURL=create-shipment.js.map