"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductCategoriesStep = exports.createProductCategoriesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createProductCategoriesStepId = "create-product-categories";
/**
 * This step creates one or more product categories.
 *
 * @example
 * const data = createProductCategoriesStep({
 *   product_categories: [
 *     {
 *       name: "Shoes",
 *     }
 *   ]
 * })
 */
exports.createProductCategoriesStep = (0, workflows_sdk_1.createStep)(exports.createProductCategoriesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    const created = await service.createProductCategories(data.product_categories);
    return new workflows_sdk_1.StepResponse(created, created.map((c) => c.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.deleteProductCategories(createdIds);
});
//# sourceMappingURL=create-product-categories.js.map