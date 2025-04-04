"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../helpers");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const collection = await (0, helpers_1.refetchCollection)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ collection });
};
exports.GET = GET;
const POST = async (req, res) => {
    const existingCollection = await (0, helpers_1.refetchCollection)(req.params.id, req.scope, [
        "id",
    ]);
    if (!existingCollection) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Collection with id "${req.params.id}" not found`);
    }
    await (0, core_flows_1.updateCollectionsWorkflow)(req.scope).run({
        input: {
            selector: { id: req.params.id },
            update: req.validatedBody,
        },
    });
    const collection = await (0, helpers_1.refetchCollection)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ collection });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    await (0, core_flows_1.deleteCollectionsWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "collection",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map