"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchInvite = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchInvite = async (inviteId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "invite",
        variables: {
            filters: { id: inviteId },
        },
        fields: fields,
    });
    const invites = await remoteQuery(queryObject);
    return invites[0];
};
exports.refetchInvite = refetchInvite;
//# sourceMappingURL=helpers.js.map