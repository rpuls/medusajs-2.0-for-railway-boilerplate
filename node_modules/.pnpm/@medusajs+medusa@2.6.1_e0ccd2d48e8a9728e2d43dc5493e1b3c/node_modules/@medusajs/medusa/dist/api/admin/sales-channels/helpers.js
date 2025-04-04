"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchSalesChannel = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchSalesChannel = async (salesChannelId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "sales_channel",
        variables: {
            filters: { id: salesChannelId },
        },
        fields: fields,
    });
    const salesChannels = await remoteQuery(queryObject);
    return salesChannels[0];
};
exports.refetchSalesChannel = refetchSalesChannel;
//# sourceMappingURL=helpers.js.map