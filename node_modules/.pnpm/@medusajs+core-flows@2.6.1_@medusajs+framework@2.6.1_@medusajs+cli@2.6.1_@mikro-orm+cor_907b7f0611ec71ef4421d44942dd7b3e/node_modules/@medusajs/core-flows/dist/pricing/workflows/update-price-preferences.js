"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePricePreferencesWorkflow = exports.updatePricePreferencesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updatePricePreferencesWorkflowId = "update-price-preferences";
/**
 * This workflow updates one or more price preferences. It's used by the
 * [Update Price Preference Admin API Route](https://docs.medusajs.com/api/admin#price-preferences_postpricepreferencesid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update price preferences in your custom flows.
 *
 * @example
 * const { result } = await updatePricePreferencesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: ["pp_123"]
 *     },
 *     update: {
 *       is_tax_inclusive: true
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more price preferences.
 */
exports.updatePricePreferencesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updatePricePreferencesWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.updatePricePreferencesStep)(input));
});
//# sourceMappingURL=update-price-preferences.js.map