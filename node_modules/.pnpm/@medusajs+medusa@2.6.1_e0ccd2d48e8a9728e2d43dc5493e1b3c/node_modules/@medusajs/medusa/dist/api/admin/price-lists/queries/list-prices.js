"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPrices = void 0;
const utils_1 = require("@medusajs/framework/utils");
const listPrices = async (ids, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "price",
        variables: {
            filters: { id: ids },
        },
        fields,
    });
    return await remoteQuery(queryObject);
};
exports.listPrices = listPrices;
//# sourceMappingURL=list-prices.js.map