"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductTypesStep = exports.deleteProductTypesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteProductTypesStepId = "delete-product-types";
/**
 * This step deletes one or more product types.
 */
exports.deleteProductTypesStep = (0, workflows_sdk_1.createStep)(exports.deleteProductTypesStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.softDeleteProductTypes(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.restoreProductTypes(prevIds);
});
//# sourceMappingURL=delete-product-types.js.map