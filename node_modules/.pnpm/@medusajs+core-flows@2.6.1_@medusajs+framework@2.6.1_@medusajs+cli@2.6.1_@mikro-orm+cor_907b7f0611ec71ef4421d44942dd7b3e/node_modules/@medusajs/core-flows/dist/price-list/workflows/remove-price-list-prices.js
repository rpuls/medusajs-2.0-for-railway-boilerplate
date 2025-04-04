"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removePriceListPricesWorkflow = exports.removePriceListPricesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const remove_price_list_prices_1 = require("../steps/remove-price-list-prices");
exports.removePriceListPricesWorkflowId = "remove-price-list-prices";
/**
 * This workflow removes price lists' prices. It's used by other workflows, such
 * as {@link batchPriceListPricesWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * remove prices in price lists in your custom flows.
 *
 * @example
 * const { result } = await removePriceListPricesWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["plist_123"]
 *   }
 * })
 *
 * @summary
 *
 * Remove prices in price lists.
 */
exports.removePriceListPricesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.removePriceListPricesWorkflowId, (input) => {
    return new workflows_sdk_1.WorkflowResponse((0, remove_price_list_prices_1.removePriceListPricesStep)(input.ids));
});
//# sourceMappingURL=remove-price-list-prices.js.map