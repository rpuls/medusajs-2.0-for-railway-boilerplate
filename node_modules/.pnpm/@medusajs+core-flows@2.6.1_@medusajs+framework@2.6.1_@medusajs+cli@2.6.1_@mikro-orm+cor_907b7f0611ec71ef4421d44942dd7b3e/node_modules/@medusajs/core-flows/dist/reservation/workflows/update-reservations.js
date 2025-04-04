"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReservationsWorkflow = exports.updateReservationsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updateReservationsWorkflowId = "update-reservations-workflow";
/**
 * This workflow updates one or more reservations. It's used by the
 * [Update Reservations Admin API Route](https://docs.medusajs.com/api/admin#reservations_postreservationsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update reservations in your custom flows.
 *
 * @example
 * const { result } = await updateReservationsWorkflow(container)
 * .run({
 *   input: {
 *     updates: [
 *       {
 *         id: "res_123",
 *         quantity: 1,
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update one or more reservations.
 */
exports.updateReservationsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateReservationsWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.updateReservationsStep)(input.updates));
});
//# sourceMappingURL=update-reservations.js.map