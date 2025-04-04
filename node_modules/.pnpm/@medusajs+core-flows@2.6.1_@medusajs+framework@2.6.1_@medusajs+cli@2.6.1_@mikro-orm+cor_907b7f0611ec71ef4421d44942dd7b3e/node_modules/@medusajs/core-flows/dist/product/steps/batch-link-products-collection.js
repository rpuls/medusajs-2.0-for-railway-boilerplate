"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchLinkProductsToCollectionStep = exports.batchLinkProductsToCollectionStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.batchLinkProductsToCollectionStepId = "batch-link-products-to-collection";
/**
 * This step manages the links between a collection and products.
 *
 * @example
 * const data = batchLinkProductsToCollectionStep({
 *   id: "collection_123",
 *   add: ["product_123"],
 *   remove: ["product_321"]
 * })
 */
exports.batchLinkProductsToCollectionStep = (0, workflows_sdk_1.createStep)(exports.batchLinkProductsToCollectionStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    if (!data.add?.length && !data.remove?.length) {
        return new workflows_sdk_1.StepResponse(void 0, null);
    }
    const dbCollection = await service.retrieveProductCollection(data.id, {
        select: ["id", "products.id"],
        relations: ["products"],
    });
    const existingProductIds = dbCollection.products?.map((p) => p.id) ?? [];
    const toRemoveMap = new Map(data.remove?.map((id) => [id, true]) ?? []);
    const newProductIds = [
        ...existingProductIds.filter((id) => !toRemoveMap.has(id)),
        ...(data.add ?? []),
    ];
    await service.updateProductCollections(data.id, {
        product_ids: newProductIds,
    });
    return new workflows_sdk_1.StepResponse(void 0, {
        id: data.id,
        productIds: existingProductIds,
    });
}, async (prevData, { container }) => {
    if (!prevData) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.updateProductCollections(prevData.id, {
        product_ids: prevData.productIds,
    });
});
//# sourceMappingURL=batch-link-products-collection.js.map