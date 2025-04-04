"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReservationsWorkflow = exports.deleteReservationsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.deleteReservationsWorkflowId = "delete-reservations";
/**
 * This workflow deletes one or more reservations. It's used by the
 * [Delete Reservations Admin API Route](https://docs.medusajs.com/api/admin#reservations_deletereservationsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete reservations in your custom flows.
 *
 * @example
 * const { result } = await deleteReservationsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["res_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more reservations.
 */
exports.deleteReservationsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteReservationsWorkflowId, (input) => {
    return (0, steps_1.deleteReservationsStep)(input.ids);
});
//# sourceMappingURL=delete-reservations.js.map