"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductsStep = exports.updateProductsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateProductsStepId = "update-products";
/**
 * This step updates one or more products.
 *
 * @example
 * To update products by their ID:
 *
 * ```ts
 * const data = updateProductsStep({
 *   products: [
 *     {
 *       id: "prod_123",
 *       title: "Shirt"
 *     }
 *   ]
 * })
 * ```
 *
 * To update products matching a filter:
 *
 * ```ts
 * const data = updateProductsStep({
 *   selector: {
 *     collection_id: "collection_123",
 *   },
 *   update: {
 *     material: "cotton",
 *   }
 * })
 * ```
 */
exports.updateProductsStep = (0, workflows_sdk_1.createStep)(exports.updateProductsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    if ("products" in data) {
        if (data.products.some((p) => !p.id)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Product ID is required when doing a batch update of products");
        }
        if (!data.products.length) {
            return new workflows_sdk_1.StepResponse([], []);
        }
        const prevData = await service.listProducts({
            id: data.products.map((p) => p.id),
        });
        const products = await service.upsertProducts(data.products);
        return new workflows_sdk_1.StepResponse(products, prevData);
    }
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listProducts(data.selector, {
        select: selects,
        relations,
    });
    const products = await service.updateProducts(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(products, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.upsertProducts(prevData.map((r) => ({
        ...r,
    })));
});
//# sourceMappingURL=update-products.js.map