"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchFulfillmentSet = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchFulfillmentSet = async (fulfillmentSetId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "fulfillment_set",
        variables: {
            filters: { id: fulfillmentSetId },
        },
        fields: fields,
    });
    const fulfillmentSets = await remoteQuery(queryObject);
    return fulfillmentSets[0];
};
exports.refetchFulfillmentSet = refetchFulfillmentSet;
//# sourceMappingURL=helpers.js.map