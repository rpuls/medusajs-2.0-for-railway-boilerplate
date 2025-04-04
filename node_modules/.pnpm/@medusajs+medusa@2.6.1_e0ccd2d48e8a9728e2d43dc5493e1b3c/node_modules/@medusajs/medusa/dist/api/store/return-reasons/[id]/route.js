"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const variables = { id: req.params.id };
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "return_reason",
        variables,
        fields: req.queryConfig.fields,
    });
    const [return_reason] = await remoteQuery(queryObject);
    res.json({ return_reason });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map