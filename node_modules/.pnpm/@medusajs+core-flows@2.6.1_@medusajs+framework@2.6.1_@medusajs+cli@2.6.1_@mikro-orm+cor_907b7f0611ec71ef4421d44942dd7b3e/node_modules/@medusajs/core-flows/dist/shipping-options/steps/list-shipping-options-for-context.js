"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listShippingOptionsForContextStep = exports.listShippingOptionsForContextStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.listShippingOptionsForContextStepId = "list-shipping-options-for-context";
/**
 * This step retrieves shipping options that can be used in the specified context, based on
 * the shipping options' rules.
 *
 * @example
 * To retrieve shipping options matching a context:
 *
 * ```ts
 * const data = listShippingOptionsForContextStep({
 *   context: {
 *     region_id: "reg_123"
 *   }
 * })
 * ```
 *
 * To retrieve shipping options matching a context with pagination:
 *
 * ```ts
 * const data = listShippingOptionsForContextStep({
 *   context: {
 *     region_id: "reg_123"
 *   },
 *   config: {
 *     skip: 0,
 *     take: 10
 *   }
 * })
 * ```
 *
 * Learn more about paginating records and selecting fields in the
 * [service factory reference](https://docs.medusajs.com/resources/service-factory-reference/methods/list).
 */
exports.listShippingOptionsForContextStep = (0, workflows_sdk_1.createStep)(exports.listShippingOptionsForContextStepId, async (data, { container }) => {
    const fulfillmentService = container.resolve(utils_1.Modules.FULFILLMENT);
    const shippingOptions = await fulfillmentService.listShippingOptionsForContext(data.context, data.config);
    return new workflows_sdk_1.StepResponse(shippingOptions);
});
//# sourceMappingURL=list-shipping-options-for-context.js.map