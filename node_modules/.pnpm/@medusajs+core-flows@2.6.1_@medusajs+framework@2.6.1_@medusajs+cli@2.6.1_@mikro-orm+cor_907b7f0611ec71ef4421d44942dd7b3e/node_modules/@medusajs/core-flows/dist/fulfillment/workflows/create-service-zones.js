"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceZonesWorkflow = exports.createServiceZonesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createServiceZonesWorkflowId = "create-service-zones-workflow";
/**
 * This workflow creates one or more service zones. It's used by the
 * [Add Service Zone to Fulfillment Set Admin API Route](https://docs.medusajs.com/api/admin#fulfillment-sets_postfulfillmentsetsidservicezones).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * create service zones within your custom flows.
 *
 * @example
 * const { result } = await createServiceZonesWorkflow(container)
 * .run({
 *   input: {
 *     data: [
 *       {
 *         name: "US",
 *         fulfillment_set_id: "fuset_123",
 *         geo_zones: [
 *           {
 *             type: "country",
 *             country_code: "us",
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more service zones.
 */
exports.createServiceZonesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createServiceZonesWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.createServiceZonesStep)(input.data));
});
//# sourceMappingURL=create-service-zones.js.map