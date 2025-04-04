"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchTaxRegion = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchTaxRegion = async (taxRegionId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "tax_region",
        variables: {
            filters: { id: taxRegionId },
        },
        fields: fields,
    });
    const taxRegions = await remoteQuery(queryObject);
    return taxRegions[0];
};
exports.refetchTaxRegion = refetchTaxRegion;
//# sourceMappingURL=helpers.js.map