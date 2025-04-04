"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservationsWorkflow = exports.createReservationsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createReservationsWorkflowId = "create-reservations-workflow";
/**
 * This workflow creates one or more reservations. It's used by the
 * [Create Reservations Admin API Route](https://docs.medusajs.com/api/admin#reservations_postreservations).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create reservations in your custom flows.
 *
 * @example
 * const { result } = await createReservationsWorkflow(container)
 * .run({
 *   input: {
 *     reservations: [
 *       {
 *         inventory_item_id: "iitem_123",
 *         location_id: "sloc_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more reservations.
 */
exports.createReservationsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createReservationsWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.createReservationsStep)(input.reservations));
});
//# sourceMappingURL=create-reservations.js.map