"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricePreferencesWorkflow = exports.createPricePreferencesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createPricePreferencesWorkflowId = "create-price-preferences";
/**
 * This workflow creates one or more price preferences. It's used by the
 * [Create Price Preferences Admin API Route](https://docs.medusajs.com/api/admin#price-preferences_postpricepreferences).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create price preferences in your custom flows.
 *
 * @example
 * const { result } = await createPricePreferencesWorkflow(container)
 * .run({
 *   input: [
 *     {
 *       attribute: "region_id",
 *       value: "reg_123",
 *       is_tax_inclusive: true
 *     }
 *   ]
 * })
 *
 * @summary
 *
 * Create one or more price preferences.
 */
exports.createPricePreferencesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createPricePreferencesWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.createPricePreferencesStep)(input));
});
//# sourceMappingURL=create-price-preferences.js.map