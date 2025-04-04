"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../helpers");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const shippingOption = await (0, helpers_1.refetchShippingOption)(req.params.id, req.scope, req.queryConfig.fields);
    if (!shippingOption) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Shipping Option with id: ${req.params.id} not found`);
    }
    res.json({ shipping_option: shippingOption });
};
exports.GET = GET;
const POST = async (req, res) => {
    const shippingOptionPayload = req.validatedBody;
    const workflow = (0, core_flows_1.updateShippingOptionsWorkflow)(req.scope);
    const workflowInput = {
        id: req.params.id,
        ...shippingOptionPayload,
    };
    const { result } = await workflow.run({
        input: [workflowInput],
    });
    const shippingOption = await (0, helpers_1.refetchShippingOption)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ shipping_option: shippingOption });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const shippingOptionId = req.params.id;
    const workflow = (0, core_flows_1.deleteShippingOptionsWorkflow)(req.scope);
    await workflow.run({
        input: { ids: [shippingOptionId] },
    });
    res
        .status(200)
        .json({ id: shippingOptionId, object: "shipping_option", deleted: true });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map