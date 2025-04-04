"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductsStep = exports.deleteProductsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteProductsStepId = "delete-products";
/**
 * This step deletes one or more products.
 */
exports.deleteProductsStep = (0, workflows_sdk_1.createStep)(exports.deleteProductsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.softDeleteProducts(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.restoreProducts(prevIds);
});
//# sourceMappingURL=delete-products.js.map