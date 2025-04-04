"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchStockLocation = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchStockLocation = async (stockLocationId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "stock_location",
        variables: {
            filters: { id: stockLocationId },
        },
        fields: fields,
    });
    const stockLocations = await remoteQuery(queryObject);
    return stockLocations[0];
};
exports.refetchStockLocation = refetchStockLocation;
//# sourceMappingURL=helpers.js.map