"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../helpers");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const apiKey = await (0, helpers_1.refetchApiKey)(req.params.id, req.scope, req.queryConfig.fields);
    if (!apiKey) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `API Key with id: ${req.params.id} was not found`);
    }
    res.status(200).json({ api_key: apiKey });
};
exports.GET = GET;
const POST = async (req, res) => {
    await (0, core_flows_1.updateApiKeysWorkflow)(req.scope).run({
        input: {
            selector: { id: req.params.id },
            update: req.validatedBody,
        },
    });
    const apiKey = await (0, helpers_1.refetchApiKey)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ api_key: apiKey });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    await (0, core_flows_1.deleteApiKeysWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "api_key",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map