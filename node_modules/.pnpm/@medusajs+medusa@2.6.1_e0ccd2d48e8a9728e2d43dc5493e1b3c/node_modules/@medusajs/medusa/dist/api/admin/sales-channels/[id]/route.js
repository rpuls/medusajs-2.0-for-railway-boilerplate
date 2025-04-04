"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../helpers");
const GET = async (req, res) => {
    const salesChannel = await (0, helpers_1.refetchSalesChannel)(req.params.id, req.scope, req.queryConfig.fields);
    if (!salesChannel) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Sales channel with id: ${req.params.id} not found`);
    }
    res.json({ sales_channel: salesChannel });
};
exports.GET = GET;
const POST = async (req, res) => {
    const existingSalesChannel = await (0, helpers_1.refetchSalesChannel)(req.params.id, req.scope, ["id"]);
    if (!existingSalesChannel) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Sales channel with id "${req.params.id}" not found`);
    }
    await (0, core_flows_1.updateSalesChannelsWorkflow)(req.scope).run({
        input: {
            selector: { id: req.params.id },
            update: req.validatedBody,
        },
    });
    const salesChannel = await (0, helpers_1.refetchSalesChannel)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ sales_channel: salesChannel });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    await (0, core_flows_1.deleteSalesChannelsWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "sales-channel",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map