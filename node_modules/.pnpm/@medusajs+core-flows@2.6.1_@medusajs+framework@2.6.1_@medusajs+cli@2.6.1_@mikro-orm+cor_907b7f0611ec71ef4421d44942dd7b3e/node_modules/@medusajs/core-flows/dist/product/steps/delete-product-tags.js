"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductTagsStep = exports.deleteProductTagsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteProductTagsStepId = "delete-product-tags";
/**
 * This step deletes one or more product tags.
 */
exports.deleteProductTagsStep = (0, workflows_sdk_1.createStep)(exports.deleteProductTagsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.softDeleteProductTags(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.restoreProductTags(prevIds);
});
//# sourceMappingURL=delete-product-tags.js.map