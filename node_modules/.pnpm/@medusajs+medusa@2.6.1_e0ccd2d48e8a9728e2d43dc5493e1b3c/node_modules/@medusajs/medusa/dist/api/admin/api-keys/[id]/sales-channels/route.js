"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../../helpers");
const POST = async (req, res) => {
    const { add, remove } = req.validatedBody;
    const apiKey = await (0, helpers_1.refetchApiKey)(req.params.id, req.scope, ["id", "type"]);
    if (apiKey.type !== utils_1.ApiKeyType.PUBLISHABLE) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Sales channels can only be associated with publishable API keys");
    }
    await (0, core_flows_1.linkSalesChannelsToApiKeyWorkflow)(req.scope).run({
        input: {
            id: req.params.id,
            add,
            remove,
        },
    });
    const updatedApiKey = await (0, helpers_1.refetchApiKey)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ api_key: updatedApiKey });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map