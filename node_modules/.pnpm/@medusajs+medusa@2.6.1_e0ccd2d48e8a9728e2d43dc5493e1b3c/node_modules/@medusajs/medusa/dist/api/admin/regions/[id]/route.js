"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../helpers");
const GET = async (req, res) => {
    const region = await (0, helpers_1.refetchRegion)(req.params.id, req.scope, req.queryConfig.fields);
    if (!region) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Region with id: ${req.params.id} not found`);
    }
    res.status(200).json({ region });
};
exports.GET = GET;
const POST = async (req, res) => {
    const existingRegion = await (0, helpers_1.refetchRegion)(req.params.id, req.scope, ["id"]);
    if (!existingRegion) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Region with id "${req.params.id}" not found`);
    }
    const { result } = await (0, core_flows_1.updateRegionsWorkflow)(req.scope).run({
        input: {
            selector: { id: req.params.id },
            update: req.validatedBody,
        },
    });
    const region = await (0, helpers_1.refetchRegion)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ region });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    await (0, core_flows_1.deleteRegionsWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "region",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map