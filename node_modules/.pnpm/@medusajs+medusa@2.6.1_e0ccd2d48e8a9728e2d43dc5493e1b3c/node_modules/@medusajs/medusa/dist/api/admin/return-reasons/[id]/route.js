"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const http_1 = require("@medusajs/framework/http");
const GET = async (req, res) => {
    const return_reason = await (0, http_1.refetchEntity)("return_reason", req.params.id, req.scope, req.queryConfig.fields);
    if (!return_reason) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Return reason with id: ${req.params.id} was not found`);
    }
    res.json({ return_reason });
};
exports.GET = GET;
const POST = async (req, res) => {
    const workflow = (0, core_flows_1.updateReturnReasonsWorkflow)(req.scope);
    const { id } = req.params;
    const input = {
        selector: { id },
        update: req.validatedBody,
    };
    const { result } = await workflow.run({ input });
    const variables = { id: result[0].id };
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "return_reason",
        variables,
        fields: req.queryConfig.fields,
    });
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const [return_reason] = await remoteQuery(queryObject);
    res.json({ return_reason });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const { id } = req.params;
    const workflow = (0, core_flows_1.deleteReturnReasonsWorkflow)(req.scope);
    const input = {
        ids: [id],
    };
    await workflow.run({ input });
    res.json({
        id,
        object: "return_reason",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map