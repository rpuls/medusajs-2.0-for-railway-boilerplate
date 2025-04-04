"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductTagsStep = exports.updateProductTagsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateProductTagsStepId = "update-product-tags";
/**
 * This step updates product tags matching the specified filters.
 *
 * @example
 * const data = updateProductTagsStep({
 *   selector: {
 *     id: "popt_123"
 *   },
 *   update: {
 *     value: "clothing"
 *   }
 * })
 */
exports.updateProductTagsStep = (0, workflows_sdk_1.createStep)(exports.updateProductTagsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listProductTags(data.selector, {
        select: selects,
        relations,
    });
    const productTags = await service.updateProductTags(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(productTags, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.upsertProductTags(prevData);
});
//# sourceMappingURL=update-product-tags.js.map