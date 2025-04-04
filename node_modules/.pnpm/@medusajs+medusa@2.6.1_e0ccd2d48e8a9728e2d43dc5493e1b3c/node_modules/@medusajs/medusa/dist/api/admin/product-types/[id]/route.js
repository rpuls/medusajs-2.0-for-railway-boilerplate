"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../helpers");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const productType = await (0, helpers_1.refetchProductType)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ product_type: productType });
};
exports.GET = GET;
const POST = async (req, res) => {
    const existingProductType = await (0, helpers_1.refetchProductType)(req.params.id, req.scope, ["id"]);
    if (!existingProductType) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Product type with id "${req.params.id}" not found`);
    }
    const { result } = await (0, core_flows_1.updateProductTypesWorkflow)(req.scope).run({
        input: {
            selector: { id: req.params.id },
            update: req.validatedBody,
        },
    });
    const productType = await (0, helpers_1.refetchProductType)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ product_type: productType });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    await (0, core_flows_1.deleteProductTypesWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "product_type",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map