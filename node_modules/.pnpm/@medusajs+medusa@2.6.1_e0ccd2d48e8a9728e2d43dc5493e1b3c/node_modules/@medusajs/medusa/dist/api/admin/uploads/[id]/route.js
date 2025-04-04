"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const variables = { id: req.params.id };
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "file",
        variables,
        fields: req.queryConfig.fields,
    });
    const [file] = await remoteQuery(queryObject);
    if (!file) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `File with id: ${req.params.id} not found`);
    }
    res.status(200).json({ file });
};
exports.GET = GET;
const DELETE = async (req, res) => {
    const id = req.params.id;
    await (0, core_flows_1.deleteFilesWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "file",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map