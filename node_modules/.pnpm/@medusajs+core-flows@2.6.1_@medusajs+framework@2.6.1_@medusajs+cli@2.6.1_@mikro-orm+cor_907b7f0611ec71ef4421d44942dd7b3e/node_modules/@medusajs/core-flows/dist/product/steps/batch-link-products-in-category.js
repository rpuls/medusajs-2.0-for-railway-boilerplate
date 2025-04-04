"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchLinkProductsToCategoryStep = exports.batchLinkProductsToCategoryStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.batchLinkProductsToCategoryStepId = "batch-link-products-to-category";
/**
 * This step manages the links between a category and products.
 *
 * @example
 * const data = batchLinkProductsToCategoryStep({
 *   id: "pcat_123",
 *   add: ["product_123"],
 *   remove: ["product_321"]
 * })
 */
exports.batchLinkProductsToCategoryStep = (0, workflows_sdk_1.createStep)(exports.batchLinkProductsToCategoryStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    if (!data.add?.length && !data.remove?.length) {
        return new workflows_sdk_1.StepResponse(void 0, null);
    }
    const toRemoveSet = new Set(data.remove?.map((id) => id));
    const dbProducts = await service.listProducts({ id: [...(data.add ?? []), ...(data.remove ?? [])] }, {
        select: ["id"],
        relations: ["categories"],
    });
    const productsWithUpdatedCategories = dbProducts.map((p) => {
        if (toRemoveSet.has(p.id)) {
            return {
                id: p.id,
                category_ids: (p.categories ?? [])
                    .filter((c) => c.id !== data.id)
                    .map((c) => c.id),
            };
        }
        return {
            id: p.id,
            category_ids: [...(p.categories ?? []).map((c) => c.id), data.id],
        };
    });
    await service.upsertProducts(productsWithUpdatedCategories);
    return new workflows_sdk_1.StepResponse(void 0, {
        id: data.id,
        remove: data.remove,
        add: data.add,
        productIds: productsWithUpdatedCategories.map((p) => p.id),
    });
}, async (prevData, { container }) => {
    if (!prevData) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    const dbProducts = await service.listProducts({ id: prevData.productIds }, {
        select: ["id"],
        relations: ["categories"],
    });
    const toRemoveSet = new Set(prevData.remove?.map((id) => id));
    const productsWithRevertedCategories = dbProducts.map((p) => {
        if (toRemoveSet.has(p.id)) {
            return {
                id: p.id,
                category_ids: [...(p.categories ?? []).map((c) => c.id), prevData.id],
            };
        }
        return {
            id: p.id,
            category_ids: (p.categories ?? [])
                .filter((c) => c.id !== prevData.id)
                .map((c) => c.id),
        };
    });
    await service.upsertProducts(productsWithRevertedCategories);
});
//# sourceMappingURL=batch-link-products-in-category.js.map