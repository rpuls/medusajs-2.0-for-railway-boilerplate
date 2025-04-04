"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductTagsStep = exports.createProductTagsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createProductTagsStepId = "create-product-tags";
/**
 * This step creates one or more product tags.
 */
exports.createProductTagsStep = (0, workflows_sdk_1.createStep)(exports.createProductTagsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    const created = await service.createProductTags(data);
    return new workflows_sdk_1.StepResponse(created, created.map((productTag) => productTag.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.deleteProductTags(createdIds);
});
//# sourceMappingURL=create-product-tags.js.map