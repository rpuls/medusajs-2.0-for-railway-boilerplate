"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceZonesWorkflow = exports.updateServiceZonesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const update_service_zones_1 = require("../steps/update-service-zones");
exports.updateServiceZonesWorkflowId = "update-service-zones-workflow";
/**
 * This workflow updates one or more service zones. It's used by the
 * [Update Service Zones Admin API Route](https://docs.medusajs.com/api/admin#fulfillment-sets_postfulfillmentsetsidservicezoneszone_id).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * update service zones within your custom flows.
 *
 * @example
 * const { result } = await updateServiceZonesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "serzo_123"
 *     },
 *     update: {
 *       name: "Europe"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more service zones.
 */
exports.updateServiceZonesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateServiceZonesWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, update_service_zones_1.updateServiceZonesStep)(input));
});
//# sourceMappingURL=update-service-zones.js.map