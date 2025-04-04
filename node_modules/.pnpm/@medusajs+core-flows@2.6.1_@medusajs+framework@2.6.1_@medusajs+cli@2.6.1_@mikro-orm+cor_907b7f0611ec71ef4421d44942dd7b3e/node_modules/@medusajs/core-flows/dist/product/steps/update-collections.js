"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCollectionsStep = exports.updateCollectionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateCollectionsStepId = "update-collections";
/**
 * This step updates collections matching the specified filters.
 *
 * @example
 * const data = updateCollectionsStep({
 *   selector: {
 *     id: "collection_123"
 *   },
 *   update: {
 *     title: "Summer Collection"
 *   }
 * })
 */
exports.updateCollectionsStep = (0, workflows_sdk_1.createStep)(exports.updateCollectionsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listProductCollections(data.selector, {
        select: selects,
        relations,
    });
    const collections = await service.updateProductCollections(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(collections, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.upsertProductCollections(prevData.map((r) => ({
        ...r,
    })));
});
//# sourceMappingURL=update-collections.js.map