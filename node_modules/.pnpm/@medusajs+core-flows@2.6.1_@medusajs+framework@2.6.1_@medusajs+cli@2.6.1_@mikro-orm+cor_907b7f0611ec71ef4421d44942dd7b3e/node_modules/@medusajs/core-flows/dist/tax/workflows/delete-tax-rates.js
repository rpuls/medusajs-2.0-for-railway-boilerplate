"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaxRatesWorkflow = exports.deleteTaxRatesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.deleteTaxRatesWorkflowId = "delete-tax-rates";
/**
 * This workflow deletes one or more tax rates. It's used by the
 * [Delete Tax Rates Admin API Route](https://docs.medusajs.com/api/admin#tax-rates_deletetaxratesid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete tax rates in your custom flows.
 *
 * @example
 * const { result } = await deleteTaxRatesWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["txr_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more tax rates.
 */
exports.deleteTaxRatesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteTaxRatesWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.deleteTaxRatesStep)(input.ids));
});
//# sourceMappingURL=delete-tax-rates.js.map