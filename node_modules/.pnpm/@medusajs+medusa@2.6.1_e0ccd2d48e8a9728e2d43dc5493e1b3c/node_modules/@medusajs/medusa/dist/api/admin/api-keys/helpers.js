"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchApiKey = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchApiKey = async (apiKeyId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "api_key",
        variables: {
            filters: { id: apiKeyId },
        },
        fields: fields,
    });
    const apiKeys = await remoteQuery(queryObject);
    return apiKeys[0];
};
exports.refetchApiKey = refetchApiKey;
//# sourceMappingURL=helpers.js.map