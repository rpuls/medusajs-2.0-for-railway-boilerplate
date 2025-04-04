"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductCategoriesStep = exports.updateProductCategoriesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateProductCategoriesStepId = "update-product-categories";
/**
 * This step updates product categories matching specified filters.
 *
 * @example
 * const data = updateProductCategoriesStep({
 *   selector: {
 *     id: "pcat_123",
 *   },
 *   update: {
 *     name: "Shoes",
 *   }
 * })
 */
exports.updateProductCategoriesStep = (0, workflows_sdk_1.createStep)(exports.updateProductCategoriesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listProductCategories(data.selector, {
        select: selects,
        relations,
    });
    const productCategories = await service.updateProductCategories(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(productCategories, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.upsertProductCategories(prevData);
});
//# sourceMappingURL=update-product-categories.js.map