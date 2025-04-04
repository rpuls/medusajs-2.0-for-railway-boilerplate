"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductVariantsStep = exports.deleteProductVariantsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteProductVariantsStepId = "delete-product-variants";
/**
 * This step deletes one or more product variants.
 */
exports.deleteProductVariantsStep = (0, workflows_sdk_1.createStep)(exports.deleteProductVariantsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.softDeleteProductVariants(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.restoreProductVariants(prevIds);
});
//# sourceMappingURL=delete-product-variants.js.map