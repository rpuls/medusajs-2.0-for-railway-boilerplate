"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPriceListsWorkflow = exports.createPriceListsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createPriceListsWorkflowId = "create-price-lists";
/**
 * This workflow creates one or more price lists. It's used by the
 * [Create Price List Admin API Route](https://docs.medusajs.com/api/admin#price-lists_postpricelists).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create price lists in your custom flows.
 *
 * @example
 * const { result } = await createPriceListsWorkflow(container)
 * .run({
 *   input: {
 *     price_lists_data: [
 *       {
 *         title: "Price List 1",
 *         description: "Price List 1 Description",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more price lists.
 */
exports.createPriceListsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createPriceListsWorkflowId, (input) => {
    const variantPriceMap = (0, steps_1.validateVariantPriceLinksStep)(input.price_lists_data);
    return new workflows_sdk_1.WorkflowResponse((0, steps_1.createPriceListsStep)({
        data: input.price_lists_data,
        variant_price_map: variantPriceMap,
    }));
});
//# sourceMappingURL=create-price-lists.js.map