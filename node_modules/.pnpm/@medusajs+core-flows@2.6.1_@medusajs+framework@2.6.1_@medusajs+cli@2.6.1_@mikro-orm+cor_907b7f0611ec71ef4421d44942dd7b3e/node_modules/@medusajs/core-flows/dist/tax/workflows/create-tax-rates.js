"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaxRatesWorkflow = exports.createTaxRatesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createTaxRatesWorkflowId = "create-tax-rates";
/**
 * This workflow creates one or more tax rates. It's used by the
 * [Create Tax Rates Admin API Route](https://docs.medusajs.com/api/admin#tax-rates_posttaxrates).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create tax rates in your custom flows.
 *
 * @example
 * const { result } = await createTaxRatesWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       tax_region_id: "txreg_123",
 *       name: "Default"
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Create one or more tax rates.
 */
exports.createTaxRatesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createTaxRatesWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.createTaxRatesStep)(input));
});
//# sourceMappingURL=create-tax-rates.js.map