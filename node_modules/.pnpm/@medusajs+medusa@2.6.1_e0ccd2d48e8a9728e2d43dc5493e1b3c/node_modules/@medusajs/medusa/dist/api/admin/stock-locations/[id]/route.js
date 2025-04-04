"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.GET = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../helpers");
const POST = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.updateStockLocationsWorkflow)(req.scope).run({
        input: {
            selector: { id: req.params.id },
            update: req.validatedBody,
        },
    });
    const stockLocation = await (0, helpers_1.refetchStockLocation)(id, req.scope, req.queryConfig.fields);
    res.status(200).json({
        stock_location: stockLocation,
    });
};
exports.POST = POST;
const GET = async (req, res) => {
    const { id } = req.params;
    const stockLocation = await (0, helpers_1.refetchStockLocation)(id, req.scope, req.queryConfig.fields);
    if (!stockLocation) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Stock location with id: ${id} was not found`);
    }
    res.status(200).json({ stock_location: stockLocation });
};
exports.GET = GET;
const DELETE = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.deleteStockLocationsWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "stock_location",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map