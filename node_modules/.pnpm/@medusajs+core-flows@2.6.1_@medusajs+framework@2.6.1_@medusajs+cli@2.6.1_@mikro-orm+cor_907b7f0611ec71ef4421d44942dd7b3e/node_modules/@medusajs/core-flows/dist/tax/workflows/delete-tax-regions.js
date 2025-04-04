"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaxRegionsWorkflow = exports.deleteTaxRegionsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.deleteTaxRegionsWorkflowId = "delete-tax-regions";
/**
 * This workflow deletes one or more tax regions. It's used by the
 * [Delete Tax Region Admin API Route](https://docs.medusajs.com/api/admin#tax-regions_deletetaxregionsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete tax regions in your custom flows.
 *
 * @example
 * const { result } = await deleteTaxRegionsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["txreg_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more tax regions.
 */
exports.deleteTaxRegionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteTaxRegionsWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.deleteTaxRegionsStep)(input.ids));
});
//# sourceMappingURL=delete-tax-regions.js.map