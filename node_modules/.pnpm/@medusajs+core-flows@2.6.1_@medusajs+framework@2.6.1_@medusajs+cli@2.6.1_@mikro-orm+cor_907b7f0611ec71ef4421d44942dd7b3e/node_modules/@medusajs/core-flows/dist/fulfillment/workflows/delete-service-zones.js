"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteServiceZonesWorkflow = exports.deleteServiceZonesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.deleteServiceZonesWorkflowId = "delete-service-zones-workflow";
/**
 * This workflow deletes one or more service zones. It's used by the
 * [Remove Service Zones from Fulfillment Set Admin API Route](https://docs.medusajs.com/api/admin#fulfillment-sets_deletefulfillmentsetsidservicezoneszone_id).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * delete service zones within your custom flows.
 *
 * @example
 * const { result } = await deleteServiceZonesWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["serzo_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more service zones.
 */
exports.deleteServiceZonesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteServiceZonesWorkflowId, (input) => {
    (0, steps_1.deleteServiceZonesStep)(input.ids);
});
//# sourceMappingURL=delete-service-zones.js.map