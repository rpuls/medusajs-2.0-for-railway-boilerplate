"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCollectionsStep = exports.deleteCollectionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteCollectionsStepId = "delete-collections";
/**
 * This step deletes one or more collections.
 */
exports.deleteCollectionsStep = (0, workflows_sdk_1.createStep)(exports.deleteCollectionsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.softDeleteProductCollections(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.restoreProductCollections(prevIds);
});
//# sourceMappingURL=delete-collections.js.map