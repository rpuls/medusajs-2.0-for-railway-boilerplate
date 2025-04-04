"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchCustomerGroup = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchCustomerGroup = async (customerGroupId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "customer_group",
        variables: {
            filters: { id: customerGroupId },
        },
        fields: fields,
    });
    const customerGroups = await remoteQuery(queryObject);
    return customerGroups[0];
};
exports.refetchCustomerGroup = refetchCustomerGroup;
//# sourceMappingURL=helpers.js.map