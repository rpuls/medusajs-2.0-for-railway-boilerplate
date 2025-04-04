"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../helpers");
const GET = async (req, res) => {
    const price_list = await (0, helpers_1.fetchPriceList)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ price_list });
};
exports.GET = GET;
const POST = async (req, res) => {
    const id = req.params.id;
    const workflow = (0, core_flows_1.updatePriceListsWorkflow)(req.scope);
    await workflow.run({
        input: { price_lists_data: [{ ...req.validatedBody, id }] },
    });
    const price_list = await (0, helpers_1.fetchPriceList)(id, req.scope, req.queryConfig.fields);
    res.status(200).json({ price_list });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    const workflow = (0, core_flows_1.deletePriceListsWorkflow)(req.scope);
    await workflow.run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "price_list",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map