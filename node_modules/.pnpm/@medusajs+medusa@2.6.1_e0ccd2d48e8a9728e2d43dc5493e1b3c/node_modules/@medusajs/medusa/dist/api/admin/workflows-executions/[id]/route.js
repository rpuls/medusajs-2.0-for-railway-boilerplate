"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const variables = { id: req.params.id };
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "workflow_execution",
        variables,
        fields: req.queryConfig.fields,
    });
    const [workflowExecution] = await remoteQuery(queryObject);
    res.status(200).json({ workflow_execution: workflowExecution });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map