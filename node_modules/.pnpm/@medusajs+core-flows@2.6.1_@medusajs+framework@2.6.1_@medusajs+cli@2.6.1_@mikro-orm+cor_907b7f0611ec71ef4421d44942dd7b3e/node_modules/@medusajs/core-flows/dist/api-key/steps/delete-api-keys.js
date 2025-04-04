"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteApiKeysStep = exports.deleteApiKeysStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteApiKeysStepId = "delete-api-keys";
/**
 * This step deletes one or more API keys.
 */
exports.deleteApiKeysStep = (0, workflows_sdk_1.createStep)({ name: exports.deleteApiKeysStepId, noCompensation: true }, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.API_KEY);
    await service.deleteApiKeys(ids);
    return new workflows_sdk_1.StepResponse(void 0);
}, async () => { });
//# sourceMappingURL=delete-api-keys.js.map