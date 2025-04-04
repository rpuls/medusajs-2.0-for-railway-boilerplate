"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaxRateRulesWorkflow = exports.createTaxRateRulesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createTaxRateRulesWorkflowId = "create-tax-rate-rules";
/**
 * This workflow creates one or more tax rules for rates. It's used by the
 * [Create Tax Rules for Rates Admin API Route](https://docs.medusajs.com/api/admin#tax-rates_posttaxratesidrules).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create tax rules for rates in your custom flows.
 *
 * @example
 * const { result } = await createTaxRateRulesWorkflow(container)
 * .run({
 *   input: {
 *     rules: [
 *       {
 *         tax_rate_id: "txr_123",
 *         reference: "product_type",
 *         reference_id: "ptyp_123"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more tax rules for rates.
 */
exports.createTaxRateRulesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createTaxRateRulesWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.createTaxRateRulesStep)(input.rules));
});
//# sourceMappingURL=create-tax-rate-rules.js.map