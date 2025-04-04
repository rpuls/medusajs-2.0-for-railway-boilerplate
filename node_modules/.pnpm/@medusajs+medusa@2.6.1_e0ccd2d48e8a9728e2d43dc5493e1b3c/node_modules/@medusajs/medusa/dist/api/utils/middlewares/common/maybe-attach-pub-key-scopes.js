"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeAttachPublishableKeyScopes = maybeAttachPublishableKeyScopes;
const utils_1 = require("@medusajs/framework/utils");
/**
 * If a publishable key (PK) is passed in the header of the request, we attach
 * the IDs of resources within the scope of the key.
 *
 * @param req - request object
 * @param res - response object
 * @param next - next middleware call
 *
 * @throws if sales channel id is passed as a url or body param
 *         but that id is not in the scope defined by the PK from the header
 */
async function maybeAttachPublishableKeyScopes(req, res, next) {
    const pubKey = req.get("x-publishable-api-key");
    if (pubKey) {
        const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
        const queryObject = (0, utils_1.remoteQueryObjectFromString)({
            entryPoint: "api_key",
            fields: ["sales_channels.id"],
            variables: {
                filters: { token: pubKey },
            },
        });
        const [apiKey] = await remoteQuery(queryObject);
        req.publishableApiKeyScopes = {
            sales_channel_ids: apiKey?.sales_channels.map((sc) => sc.id) ?? [],
        };
    }
    next();
}
//# sourceMappingURL=maybe-attach-pub-key-scopes.js.map