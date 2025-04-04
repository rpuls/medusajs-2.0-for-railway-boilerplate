"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductOptionsStep = exports.updateProductOptionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateProductOptionsStepId = "update-product-options";
/**
 * This step updates product options matching the specified filters.
 *
 * @example
 * const data = updateProductOptionsStep({
 *   selector: {
 *     id: "popt_123"
 *   },
 *   update: {
 *     title: "Size"
 *   }
 * })
 */
exports.updateProductOptionsStep = (0, workflows_sdk_1.createStep)(exports.updateProductOptionsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listProductOptions(data.selector, {
        select: selects,
        relations,
    });
    const productOptions = await service.updateProductOptions(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(productOptions, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.upsertProductOptions(prevData.map((o) => ({
        ...o,
        values: o.values?.map((v) => v.value),
        product: undefined,
        product_id: o.product_id ?? undefined,
    })));
});
//# sourceMappingURL=update-product-options.js.map