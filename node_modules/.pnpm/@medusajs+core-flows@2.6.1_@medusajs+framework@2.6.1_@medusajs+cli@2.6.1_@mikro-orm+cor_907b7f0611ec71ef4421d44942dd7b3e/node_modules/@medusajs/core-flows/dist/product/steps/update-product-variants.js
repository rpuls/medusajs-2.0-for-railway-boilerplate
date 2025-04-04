"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductVariantsStep = exports.updateProductVariantsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateProductVariantsStepId = "update-product-variants";
/**
 * This step updates one or more product variants.
 *
 * @example
 * To update product variants by their ID:
 *
 * ```ts
 * const data = updateProductVariantsStep({
 *   product_variants: [
 *     {
 *       id: "variant_123",
 *       title: "Small Shirt"
 *     }
 *   ]
 * })
 * ```
 *
 * To update product variants matching a filter:
 *
 * ```ts
 * const data = updateProductVariantsStep({
 *   selector: {
 *     product_id: "prod_123",
 *   },
 *   update: {
 *     material: "cotton",
 *   }
 * })
 * ```
 */
exports.updateProductVariantsStep = (0, workflows_sdk_1.createStep)(exports.updateProductVariantsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    if ("product_variants" in data) {
        if (data.product_variants.some((p) => !p.id)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Product variant ID is required when doing a batch update of product variants");
        }
        const prevData = await service.listProductVariants({
            id: data.product_variants.map((p) => p.id),
        });
        const productVariants = await service.upsertProductVariants(data.product_variants);
        return new workflows_sdk_1.StepResponse(productVariants, prevData);
    }
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listProductVariants(data.selector, {
        select: selects,
        relations,
    });
    const productVariants = await service.updateProductVariants(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(productVariants, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.upsertProductVariants(prevData);
});
//# sourceMappingURL=update-product-variants.js.map