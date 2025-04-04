"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiKeysStep = exports.createApiKeysStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createApiKeysStepId = "create-api-keys";
/**
 * This step creates one or more API keys.
 *
 * @example
 * const data = createApiKeysStep({
 *   api_keys: [
 *     {
 *       type: "publishable",
 *       title: "Storefront",
 *       created_by: "user_123"
 *     }
 *   ]
 * })
 */
exports.createApiKeysStep = (0, workflows_sdk_1.createStep)(exports.createApiKeysStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.API_KEY);
    const created = await service.createApiKeys(data.api_keys);
    return new workflows_sdk_1.StepResponse(created, created.map((apiKey) => apiKey.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.API_KEY);
    await service.deleteApiKeys(createdIds);
});
//# sourceMappingURL=create-api-keys.js.map