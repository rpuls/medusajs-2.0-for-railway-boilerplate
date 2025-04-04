"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "region",
        variables: {
            filters: { id: req.params.id },
        },
        fields: req.queryConfig.fields,
    });
    const [region] = await remoteQuery(queryObject);
    if (!region) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Region with id: ${req.params.id} was not found`);
    }
    res.status(200).json({ region });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map