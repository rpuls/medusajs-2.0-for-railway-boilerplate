"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchUser = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchUser = async (userId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "user",
        variables: {
            filters: { id: userId },
        },
        fields: fields,
    });
    const users = await remoteQuery(queryObject);
    return users[0];
};
exports.refetchUser = refetchUser;
//# sourceMappingURL=helpers.js.map