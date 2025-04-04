"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeApiKeysStep = exports.revokeApiKeysStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.revokeApiKeysStepId = "revoke-api-keys";
/**
 * This step revokes one or more API keys.
 *
 * @example
 * const data = revokeApiKeysStep({
 *   selector: {
 *     id: "apk_123"
 *   },
 *   revoke: {
 *     revoked_by: "user_123"
 *   }
 * })
 */
exports.revokeApiKeysStep = (0, workflows_sdk_1.createStep)({ name: exports.revokeApiKeysStepId, noCompensation: true }, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.API_KEY);
    const apiKeys = await service.revoke(data.selector, data.revoke);
    return new workflows_sdk_1.StepResponse(apiKeys);
}, async () => { });
//# sourceMappingURL=revoke-api-keys.js.map