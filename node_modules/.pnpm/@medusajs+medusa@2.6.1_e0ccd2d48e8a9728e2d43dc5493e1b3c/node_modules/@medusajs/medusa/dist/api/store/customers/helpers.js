"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchCustomer = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchCustomer = async (customerId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "customer",
        variables: {
            filters: { id: customerId },
        },
        fields: fields,
    });
    const customers = await remoteQuery(queryObject);
    return customers[0];
};
exports.refetchCustomer = refetchCustomer;
//# sourceMappingURL=helpers.js.map