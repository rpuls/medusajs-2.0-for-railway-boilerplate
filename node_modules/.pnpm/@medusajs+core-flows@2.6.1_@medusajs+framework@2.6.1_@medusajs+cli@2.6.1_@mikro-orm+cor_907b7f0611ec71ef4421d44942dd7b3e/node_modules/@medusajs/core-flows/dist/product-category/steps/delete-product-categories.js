"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductCategoriesStep = exports.deleteProductCategoriesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteProductCategoriesStepId = "delete-product-categories";
/**
 * This step deletes one or more product categories.
 */
exports.deleteProductCategoriesStep = (0, workflows_sdk_1.createStep)(exports.deleteProductCategoriesStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.softDeleteProductCategories(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.restoreProductCategories(prevIds);
});
//# sourceMappingURL=delete-product-categories.js.map