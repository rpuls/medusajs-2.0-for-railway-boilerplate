"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateApiKeysStep = exports.updateApiKeysStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateApiKeysStepId = "update-api-keys";
/**
 * This step updates one or more API keys.
 *
 * @example
 * const data = updateApiKeysStep({
 *   selector: {
 *     id: "apk_123"
 *   },
 *   update: {
 *     title: "Storefront"
 *   }
 * })
 */
exports.updateApiKeysStep = (0, workflows_sdk_1.createStep)(exports.updateApiKeysStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.API_KEY);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listApiKeys(data.selector, {
        select: selects,
        relations,
    });
    const apiKeys = await service.updateApiKeys(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(apiKeys, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.API_KEY);
    await service.upsertApiKeys(prevData.map((r) => ({
        id: r.id,
        title: r.title,
    })));
});
//# sourceMappingURL=update-api-keys.js.map