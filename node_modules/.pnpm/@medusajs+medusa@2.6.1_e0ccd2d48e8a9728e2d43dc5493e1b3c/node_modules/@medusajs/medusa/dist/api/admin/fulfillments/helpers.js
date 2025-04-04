"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchFulfillment = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchFulfillment = async (fulfillmentId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "fulfillments",
        variables: {
            filters: { id: fulfillmentId },
        },
        fields: fields,
    });
    const [fulfillment] = await remoteQuery(queryObject);
    return fulfillment;
};
exports.refetchFulfillment = refetchFulfillment;
//# sourceMappingURL=helpers.js.map