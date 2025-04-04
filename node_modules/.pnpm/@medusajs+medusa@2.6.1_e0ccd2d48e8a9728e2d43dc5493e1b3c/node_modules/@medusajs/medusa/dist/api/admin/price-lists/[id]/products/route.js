"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../../helpers");
const POST = async (req, res) => {
    const id = req.params.id;
    const { remove = [] } = req.validatedBody;
    if (!remove.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "No product ids passed to remove from price list");
    }
    const productPriceIds = await (0, helpers_1.fetchPriceListPriceIdsForProduct)(id, remove, req.scope);
    const workflow = (0, core_flows_1.batchPriceListPricesWorkflow)(req.scope);
    await workflow.run({
        input: {
            data: {
                id,
                create: [],
                update: [],
                delete: productPriceIds,
            },
        },
    });
    const priceList = await (0, helpers_1.fetchPriceList)(id, req.scope, req.queryConfig.fields);
    res.status(200).json({ price_list: priceList });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map