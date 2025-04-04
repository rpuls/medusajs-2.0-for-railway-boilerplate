"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchProductType = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchProductType = async (productTypeId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "product_type",
        variables: {
            filters: { id: productTypeId },
        },
        fields: fields,
    });
    const productTypes = await remoteQuery(queryObject);
    return productTypes[0];
};
exports.refetchProductType = refetchProductType;
//# sourceMappingURL=helpers.js.map