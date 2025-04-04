"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShippingOptionRulesStep = exports.createShippingOptionRulesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createShippingOptionRulesStepId = "create-shipping-option-rules";
/**
 * This step creates one or more shipping option rules.
 */
exports.createShippingOptionRulesStep = (0, workflows_sdk_1.createStep)(exports.createShippingOptionRulesStepId, async (input, { container }) => {
    const { data } = input;
    const fulfillmentModule = container.resolve(utils_1.Modules.FULFILLMENT);
    const createdShippingOptionRules = await fulfillmentModule.createShippingOptionRules(data);
    return new workflows_sdk_1.StepResponse(createdShippingOptionRules, createdShippingOptionRules.map((pr) => pr.id));
}, async (ruleIds, { container }) => {
    if (!ruleIds?.length) {
        return;
    }
    const fulfillmentModule = container.resolve(utils_1.Modules.FULFILLMENT);
    await fulfillmentModule.deleteShippingOptionRules(ruleIds);
});
//# sourceMappingURL=create-shipping-option-rules.js.map