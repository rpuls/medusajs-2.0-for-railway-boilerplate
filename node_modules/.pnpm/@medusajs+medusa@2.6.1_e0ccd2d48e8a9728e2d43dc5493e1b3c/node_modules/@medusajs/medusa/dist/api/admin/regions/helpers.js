"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchRegion = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchRegion = async (regionId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "region",
        variables: {
            filters: { id: regionId },
        },
        fields: fields,
    });
    const regions = await remoteQuery(queryObject);
    return regions[0];
};
exports.refetchRegion = refetchRegion;
//# sourceMappingURL=helpers.js.map