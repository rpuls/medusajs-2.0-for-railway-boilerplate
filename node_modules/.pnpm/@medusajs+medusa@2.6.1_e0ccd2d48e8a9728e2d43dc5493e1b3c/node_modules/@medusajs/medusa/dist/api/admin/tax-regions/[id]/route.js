"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const filters = { id: req.params.id };
    const [taxRegion] = await remoteQuery((0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "tax_region",
        variables: { filters },
        fields: req.queryConfig.fields,
    }));
    res.status(200).json({ tax_region: taxRegion });
};
exports.GET = GET;
const POST = async (req, res) => {
    const { id } = req.params;
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    await (0, core_flows_1.updateTaxRegionsWorkflow)(req.scope).run({
        input: [
            {
                id,
                ...req.validatedBody,
            },
        ],
    });
    const { data: [tax_region], } = await query.graph({
        entity: "tax_region",
        fields: req.queryConfig.fields,
        filters: { id },
    }, { throwIfKeyNotFound: true });
    return res.json({ tax_region });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    await (0, core_flows_1.deleteTaxRegionsWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "tax_region",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map