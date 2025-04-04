"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const variables = { filters: { code: req.params.code } };
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "currency",
        variables,
        fields: req.queryConfig.fields,
    });
    const [currency] = await remoteQuery(queryObject);
    if (!currency) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Currency with code: ${req.params.code} was not found`);
    }
    res.status(200).json({ currency });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map