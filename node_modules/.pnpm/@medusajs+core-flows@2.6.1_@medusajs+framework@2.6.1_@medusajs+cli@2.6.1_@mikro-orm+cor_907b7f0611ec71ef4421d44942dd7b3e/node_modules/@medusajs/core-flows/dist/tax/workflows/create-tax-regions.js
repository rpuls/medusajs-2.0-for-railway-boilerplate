"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaxRegionsWorkflow = exports.createTaxRegionsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createTaxRegionsWorkflowId = "create-tax-regions";
/**
 * This workflow creates one or more tax regions. It's used by the
 * [Create Tax Region Admin API Route](https://docs.medusajs.com/api/admin#tax-regions_posttaxregions).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create tax regions in your custom flows.
 *
 * @example
 * const { result } = await createTaxRegionsWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       country_code: "us",
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Create one or more tax regions.
 */
exports.createTaxRegionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createTaxRegionsWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.createTaxRegionsStep)(input));
});
//# sourceMappingURL=create-tax-regions.js.map