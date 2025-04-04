"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchOrder = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchOrder = async (orderId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "order",
        variables: {
            filters: { id: orderId },
        },
        fields: fields,
    });
    const orders = await remoteQuery(queryObject);
    return orders[0];
};
exports.refetchOrder = refetchOrder;
//# sourceMappingURL=helpers.js.map