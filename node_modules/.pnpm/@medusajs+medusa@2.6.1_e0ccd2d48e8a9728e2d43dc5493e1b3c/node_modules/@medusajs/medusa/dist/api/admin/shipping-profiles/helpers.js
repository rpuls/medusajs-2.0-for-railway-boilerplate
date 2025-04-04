"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchShippingProfile = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchShippingProfile = async (shippingProfileId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "shipping_profile",
        variables: {
            filters: { id: shippingProfileId },
        },
        fields: fields,
    });
    const shippingProfiles = await remoteQuery(queryObject);
    return shippingProfiles[0];
};
exports.refetchShippingProfile = refetchShippingProfile;
//# sourceMappingURL=helpers.js.map