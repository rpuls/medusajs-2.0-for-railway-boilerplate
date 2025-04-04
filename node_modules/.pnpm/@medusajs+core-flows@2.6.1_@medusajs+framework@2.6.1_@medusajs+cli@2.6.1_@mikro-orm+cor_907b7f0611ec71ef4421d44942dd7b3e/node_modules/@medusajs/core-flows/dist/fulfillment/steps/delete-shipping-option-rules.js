"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShippingOptionRulesStep = exports.deleteShippingOptionRulesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteShippingOptionRulesStepId = "delete-shipping-option-rules";
/**
 * This step deletes one or more shipping option rules.
 */
exports.deleteShippingOptionRulesStep = (0, workflows_sdk_1.createStep)(exports.deleteShippingOptionRulesStepId, async (input, { container }) => {
    if (!input.ids?.length) {
        return;
    }
    const { ids } = input;
    const fulfillmentModule = container.resolve(utils_1.Modules.FULFILLMENT);
    const shippingOptionRules = await fulfillmentModule.listShippingOptionRules({ id: ids }, { select: ["attribute", "operator", "value", "shipping_option_id"] });
    await fulfillmentModule.deleteShippingOptionRules(ids);
    return new workflows_sdk_1.StepResponse(ids, shippingOptionRules);
}, async (shippingOptionRules, { container }) => {
    if (!shippingOptionRules?.length) {
        return;
    }
    const fulfillmentModule = container.resolve(utils_1.Modules.FULFILLMENT);
    await fulfillmentModule.createShippingOptionRules(shippingOptionRules.map((rule) => ({
        id: rule.id,
        attribute: rule.attribute,
        operator: rule.operator,
        value: rule.value,
        shipping_option_id: rule.shipping_option_id,
    })));
});
//# sourceMappingURL=delete-shipping-option-rules.js.map