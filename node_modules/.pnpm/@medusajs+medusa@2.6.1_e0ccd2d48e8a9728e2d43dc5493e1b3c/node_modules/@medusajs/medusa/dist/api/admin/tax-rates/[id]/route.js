"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.GET = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../helpers");
const POST = async (req, res) => {
    const existingTaxRate = await (0, helpers_1.refetchTaxRate)(req.params.id, req.scope, ["id"]);
    if (!existingTaxRate) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Tax rate with id "${req.params.id}" not found`);
    }
    await (0, core_flows_1.updateTaxRatesWorkflow)(req.scope).run({
        input: {
            selector: { id: req.params.id },
            update: { ...req.validatedBody, updated_by: req.auth_context.actor_id },
        },
    });
    const taxRate = await (0, helpers_1.refetchTaxRate)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ tax_rate: taxRate });
};
exports.POST = POST;
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const variables = { id: req.params.id };
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "tax_rate",
        variables,
        fields: req.queryConfig.fields,
    });
    const [taxRate] = await remoteQuery(queryObject);
    res.status(200).json({ tax_rate: taxRate });
};
exports.GET = GET;
const DELETE = async (req, res) => {
    const id = req.params.id;
    await (0, core_flows_1.deleteTaxRatesWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "tax_rate",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map