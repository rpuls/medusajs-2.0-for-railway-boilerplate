"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensurePublishableApiKeyMiddleware = ensurePublishableApiKeyMiddleware;
const utils_1 = require("@medusajs/utils");
async function ensurePublishableApiKeyMiddleware(req, _, next) {
    const publishableApiKey = req.get(utils_1.PUBLISHABLE_KEY_HEADER);
    if (!(0, utils_1.isPresent)(publishableApiKey)) {
        const error = new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Publishable API key required in the request header: ${utils_1.PUBLISHABLE_KEY_HEADER}. You can manage your keys in settings in the dashboard.`);
        return next(error);
    }
    let apiKey;
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    try {
        const { data } = await query.graph({
            entity: "api_key",
            fields: ["id", "token", "sales_channels_link.sales_channel_id"],
            filters: {
                token: publishableApiKey,
                type: utils_1.ApiKeyType.PUBLISHABLE,
                $or: [
                    { revoked_at: { $eq: null } },
                    { revoked_at: { $gt: new Date() } },
                ],
            },
        });
        apiKey = data[0];
    }
    catch (e) {
        return next(e);
    }
    if (!apiKey) {
        try {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `A valid publishable key is required to proceed with the request`);
        }
        catch (e) {
            return next(e);
        }
    }
    req.publishable_key_context = {
        key: apiKey.token,
        sales_channel_ids: apiKey.sales_channels_link.map((link) => link.sales_channel_id),
    };
    return next();
}
//# sourceMappingURL=ensure-publishable-api-key.js.map