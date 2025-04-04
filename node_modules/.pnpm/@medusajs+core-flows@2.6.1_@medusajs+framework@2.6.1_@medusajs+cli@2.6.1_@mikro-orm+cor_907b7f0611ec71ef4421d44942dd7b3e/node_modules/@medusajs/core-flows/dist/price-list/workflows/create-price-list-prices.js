"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPriceListPricesWorkflow = exports.createPriceListPricesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const create_price_list_prices_1 = require("../steps/create-price-list-prices");
const validate_price_lists_1 = require("../steps/validate-price-lists");
const validate_variant_price_links_1 = require("../steps/validate-variant-price-links");
exports.createPriceListPricesWorkflowId = "create-price-list-prices";
/**
 * This workflow creates prices in price lists. It's used by other workflows, such as
 * {@link batchPriceListPricesWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create prices in price lists in your custom flows.
 *
 * @example
 * const { result } = await createPriceListPricesWorkflow(container)
 * .run({
 *   input: {
 *     data: [{
 *       id: "plist_123",
 *       prices: [
 *         {
 *           amount: 10,
 *           currency_code: "usd",
 *           variant_id: "variant_123"
 *         }
 *       ],
 *     }]
 *   }
 * })
 *
 * @summary
 *
 * Create prices in price lists.
 */
exports.createPriceListPricesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createPriceListPricesWorkflowId, (input) => {
    const [_, variantPriceMap] = (0, workflows_sdk_1.parallelize)((0, validate_price_lists_1.validatePriceListsStep)(input.data), (0, validate_variant_price_links_1.validateVariantPriceLinksStep)(input.data));
    return new workflows_sdk_1.WorkflowResponse((0, create_price_list_prices_1.createPriceListPricesStep)({
        data: input.data,
        variant_price_map: variantPriceMap,
    }));
});
//# sourceMappingURL=create-price-list-prices.js.map