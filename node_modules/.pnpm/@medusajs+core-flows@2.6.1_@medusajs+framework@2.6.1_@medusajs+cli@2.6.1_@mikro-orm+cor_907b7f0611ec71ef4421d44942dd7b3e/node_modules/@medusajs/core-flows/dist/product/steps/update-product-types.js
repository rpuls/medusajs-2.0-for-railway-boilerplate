"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductTypesStep = exports.updateProductTypesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateProductTypesStepId = "update-product-types";
/**
 * This step updates product types matching the specified filters.
 *
 * @example
 * const data = updateProductTypesStep({
 *   selector: {
 *     id: "popt_123"
 *   },
 *   update: {
 *     value: "clothing"
 *   }
 * })
 */
exports.updateProductTypesStep = (0, workflows_sdk_1.createStep)(exports.updateProductTypesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listProductTypes(data.selector, {
        select: selects,
        relations,
    });
    const productTypes = await service.updateProductTypes(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(productTypes, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.upsertProductTypes(prevData);
});
//# sourceMappingURL=update-product-types.js.map