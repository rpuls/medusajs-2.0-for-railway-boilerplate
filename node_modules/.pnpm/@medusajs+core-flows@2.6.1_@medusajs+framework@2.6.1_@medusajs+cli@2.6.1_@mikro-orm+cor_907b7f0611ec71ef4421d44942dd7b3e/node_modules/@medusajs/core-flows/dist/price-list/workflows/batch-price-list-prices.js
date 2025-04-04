"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchPriceListPricesWorkflow = exports.batchPriceListPricesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const create_price_list_prices_1 = require("./create-price-list-prices");
const remove_price_list_prices_1 = require("./remove-price-list-prices");
const update_price_list_prices_1 = require("./update-price-list-prices");
exports.batchPriceListPricesWorkflowId = "batch-price-list-prices";
/**
 * This workflow manages a price list's prices by creating, updating, or removing them. It's used by the
 * [Manage Prices in Price List Admin API Route](https://docs.medusajs.com/api/admin#price-lists_postpricelistsidpricesbatch).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * manage price lists' prices in your custom flows.
 *
 * @example
 * const { result } = await batchPriceListPricesWorkflow(container)
 * .run({
 *   input: {
 *     data: {
 *       id: "plist_123",
 *       create: [
 *         {
 *           amount: 10,
 *           currency_code: "usd",
 *           variant_id: "variant_123"
 *         }
 *       ],
 *       update: [
 *         {
 *           id: "price_123",
 *           amount: 10,
 *           currency_code: "usd",
 *           variant_id: "variant_123"
 *         }
 *       ],
 *       delete: ["price_321"]
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Manage a price list's prices.
 */
exports.batchPriceListPricesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.batchPriceListPricesWorkflowId, (input) => {
    const createInput = (0, workflows_sdk_1.transform)({ input: input.data }, (data) => [
        { id: data.input.id, prices: data.input.create },
    ]);
    const updateInput = (0, workflows_sdk_1.transform)({ input: input.data }, (data) => [
        { id: data.input.id, prices: data.input.update },
    ]);
    const [created, updated, deleted] = (0, workflows_sdk_1.parallelize)(create_price_list_prices_1.createPriceListPricesWorkflow.runAsStep({
        input: {
            data: createInput,
        },
    }), update_price_list_prices_1.updatePriceListPricesWorkflow.runAsStep({
        input: {
            data: updateInput,
        },
    }), remove_price_list_prices_1.removePriceListPricesWorkflow.runAsStep({
        input: {
            ids: input.data.delete,
        },
    }));
    return new workflows_sdk_1.WorkflowResponse((0, workflows_sdk_1.transform)({ created, updated, deleted }, (data) => data));
});
//# sourceMappingURL=batch-price-list-prices.js.map