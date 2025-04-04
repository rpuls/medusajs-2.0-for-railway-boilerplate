"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCollectionsStep = exports.createCollectionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createCollectionsStepId = "create-collections";
/**
 * This step creates one or more collection.
 */
exports.createCollectionsStep = (0, workflows_sdk_1.createStep)(exports.createCollectionsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    const created = await service.createProductCollections(data);
    return new workflows_sdk_1.StepResponse(created, created.map((collection) => collection.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.deleteProductCollections(createdIds);
});
//# sourceMappingURL=create-collections.js.map