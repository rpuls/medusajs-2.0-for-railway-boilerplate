"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchCampaign = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchCampaign = async (campaignId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "campaign",
        variables: {
            filters: { id: campaignId },
        },
        fields: fields,
    });
    const campaigns = await remoteQuery(queryObject);
    return campaigns[0];
};
exports.refetchCampaign = refetchCampaign;
//# sourceMappingURL=helpers.js.map