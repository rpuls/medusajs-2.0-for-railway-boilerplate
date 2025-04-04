"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchCollection = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchCollection = async (collectionId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "product_collection",
        variables: {
            filters: { id: collectionId },
        },
        fields: fields,
    });
    const collections = await remoteQuery(queryObject);
    return collections[0];
};
exports.refetchCollection = refetchCollection;
//# sourceMappingURL=helpers.js.map