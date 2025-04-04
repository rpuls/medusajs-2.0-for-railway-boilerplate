"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePriceListsWorkflow = exports.updatePriceListsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updatePriceListsWorkflowId = "update-price-lists";
/**
 * This workflow updates one or more price lists. It's used by the
 * [Update Price List Admin API Route](https://docs.medusajs.com/api/admin#price-lists_postpricelistsid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update price lists in your custom flows.
 *
 * @example
 * const { result } = await updatePriceListsWorkflow(container)
 * .run({
 *   input: {
 *     price_lists_data: [
 *       {
 *         id: "plist_123",
 *         title: "Test Price List",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update one or more price lists.
 */
exports.updatePriceListsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updatePriceListsWorkflowId, (input) => {
    (0, steps_1.validatePriceListsStep)(input.price_lists_data);
    (0, steps_1.updatePriceListsStep)(input.price_lists_data);
});
//# sourceMappingURL=update-price-lists.js.map