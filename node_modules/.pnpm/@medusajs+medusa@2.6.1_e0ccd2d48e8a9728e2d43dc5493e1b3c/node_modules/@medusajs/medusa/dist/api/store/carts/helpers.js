"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchCart = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchCart = async (id, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "cart",
        variables: { filters: { id } },
        fields,
    });
    const [cart] = await remoteQuery(queryObject);
    return cart;
};
exports.refetchCart = refetchCart;
//# sourceMappingURL=helpers.js.map