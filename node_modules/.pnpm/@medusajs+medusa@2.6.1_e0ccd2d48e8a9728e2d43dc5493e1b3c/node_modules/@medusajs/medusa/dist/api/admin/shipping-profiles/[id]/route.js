"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.DELETE = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../helpers");
const GET = async (req, res) => {
    const shippingProfile = await (0, helpers_1.refetchShippingProfile)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ shipping_profile: shippingProfile });
};
exports.GET = GET;
const DELETE = async (req, res) => {
    const { id } = req.params;
    const fulfillmentModuleService = req.scope.resolve(utils_1.Modules.FULFILLMENT);
    // Test if exists
    await fulfillmentModuleService.retrieveShippingProfile(id);
    await (0, core_flows_1.deleteShippingProfileWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "shipping_profile",
        deleted: true,
    });
};
exports.DELETE = DELETE;
const POST = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.updateShippingProfilesWorkflow)(req.scope).run({
        input: { selector: { id }, update: req.body },
    });
    const shippingProfile = await (0, helpers_1.refetchShippingProfile)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({
        shipping_profile: shippingProfile,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map