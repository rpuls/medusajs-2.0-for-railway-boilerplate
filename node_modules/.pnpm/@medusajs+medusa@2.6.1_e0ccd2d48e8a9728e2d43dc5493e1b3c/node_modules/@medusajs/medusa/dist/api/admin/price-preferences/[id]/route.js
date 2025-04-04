"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const http_1 = require("@medusajs/framework/http");
const GET = async (req, res) => {
    const price_preference = await (0, http_1.refetchEntity)("price_preference", req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ price_preference });
};
exports.GET = GET;
const POST = async (req, res) => {
    const id = req.params.id;
    const workflow = (0, core_flows_1.updatePricePreferencesWorkflow)(req.scope);
    await workflow.run({
        input: { selector: { id: [id] }, update: req.body },
    });
    const price_preference = await (0, http_1.refetchEntity)("price_preference", id, req.scope, req.queryConfig.fields);
    res.status(200).json({ price_preference });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    const workflow = (0, core_flows_1.deletePricePreferencesWorkflow)(req.scope);
    await workflow.run({
        input: [id],
    });
    res.status(200).json({
        id,
        object: "price_preference",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map