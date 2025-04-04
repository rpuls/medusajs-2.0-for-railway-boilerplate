"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaxRatesWorkflow = exports.updateTaxRatesWorkflowId = exports.maybeListTaxRateRuleIdsStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
// TODO: When we figure out how to compensate nested workflows, we can use this
//
// export const maybeSetTaxRateRulesStepId = "maybe-set-tax-rate-rules"
// const maybeSetTaxRateRules = createStep(
//   maybeSetTaxRateRulesStepId,
//   async (input: StepInput, { container }) => {
//     const { update } = input
//
//     if (!update.rules) {
//       return new StepResponse([], "")
//     }
//
//     const { result, transaction } = await setTaxRateRulesWorkflow(
//       container
//     ).run({
//       input: {
//         tax_rate_ids: input.tax_rate_ids,
//         rules: update.rules,
//       },
//     })
//
//     return new StepResponse(result, transaction.transactionId)
//   },
//   async (transactionId, { container }) => {
//     if (!transactionId) {
//       return
//     }
//
//     await setTaxRateRulesWorkflow(container).cancel(transactionId)
//   }
// )
const maybeListTaxRateRuleIdsStepId = "maybe-list-tax-rate-rule-ids";
/**
 * This step lists the rules to update in a tax rate update object.
 *
 * @example
 * const data = maybeListTaxRateRuleIdsStep({
 *   tax_rate_ids: ["txr_123"],
 *   update: {
 *     code: "VAT",
 *   }
 * })
 */
exports.maybeListTaxRateRuleIdsStep = (0, workflows_sdk_1.createStep)(maybeListTaxRateRuleIdsStepId, async (input, { container }) => {
    const { update, tax_rate_ids } = input;
    if (!update.rules) {
        return new workflows_sdk_1.StepResponse([]);
    }
    const service = container.resolve(utils_1.Modules.TAX);
    const rules = await service.listTaxRateRules({ tax_rate_id: tax_rate_ids }, { select: ["id"] });
    return new workflows_sdk_1.StepResponse(rules.map((r) => r.id));
});
exports.updateTaxRatesWorkflowId = "update-tax-rates";
/**
 * This workflow updates tax rates matching specified filters. It's used by the
 * [Update Tax Rates Admin API Route](https://docs.medusajs.com/api/admin#tax-rates_posttaxratesid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update tax rates in your custom flows.
 *
 * @example
 * const { result } = await updateTaxRatesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: ["txr_123"]
 *     },
 *     update: {
 *       code: "VAT"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update tax rates.
 */
exports.updateTaxRatesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateTaxRatesWorkflowId, (input) => {
    const cleanedUpdateInput = (0, workflows_sdk_1.transform)(input, (data) => {
        // Transform clones data so we can safely modify it
        if (data.update.rules) {
            delete data.update.rules;
        }
        return {
            selector: data.selector,
            update: data.update,
        };
    });
    const updatedRates = (0, steps_1.updateTaxRatesStep)(cleanedUpdateInput);
    const rateIds = (0, workflows_sdk_1.transform)(updatedRates, (rates) => rates.map((r) => r.id));
    // TODO: Use when we figure out how to compensate nested workflows
    // maybeSetTaxRateRules({
    //   tax_rate_ids: rateIds,
    //   update: input.update,
    // })
    // COPY-PASTE from set-tax-rate-rules.ts
    const ruleIds = (0, exports.maybeListTaxRateRuleIdsStep)({
        tax_rate_ids: rateIds,
        update: input.update,
    });
    (0, steps_1.deleteTaxRateRulesStep)(ruleIds);
    const rulesWithRateId = (0, workflows_sdk_1.transform)({ update: input.update, rateIds }, ({ update, rateIds }) => {
        if (!update.rules) {
            return [];
        }
        const updatedBy = update.updated_by;
        return update.rules
            .map((r) => {
            return rateIds.map((id) => {
                return {
                    ...r,
                    created_by: updatedBy,
                    tax_rate_id: id,
                };
            });
        })
            .flat();
    });
    (0, steps_1.createTaxRateRulesStep)(rulesWithRateId);
    // end of COPY-PASTE from set-tax-rate-rules.ts
    return new workflows_sdk_1.WorkflowResponse(updatedRates);
});
//# sourceMappingURL=update-tax-rates.js.map