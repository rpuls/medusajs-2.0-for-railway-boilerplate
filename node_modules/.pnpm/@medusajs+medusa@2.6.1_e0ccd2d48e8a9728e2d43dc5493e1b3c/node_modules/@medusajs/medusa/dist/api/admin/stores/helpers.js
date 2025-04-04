"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchStore = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchStore = async (storeId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "store",
        variables: {
            filters: { id: storeId },
        },
        fields: fields,
    });
    const stores = await remoteQuery(queryObject);
    return stores[0];
};
exports.refetchStore = refetchStore;
//# sourceMappingURL=helpers.js.map