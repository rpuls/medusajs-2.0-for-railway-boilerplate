"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductOptionsStep = exports.deleteProductOptionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteProductOptionsStepId = "delete-product-options";
/**
 * This step deletes one or more product options.
 */
exports.deleteProductOptionsStep = (0, workflows_sdk_1.createStep)(exports.deleteProductOptionsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.softDeleteProductOptions(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.restoreProductOptions(prevIds);
});
//# sourceMappingURL=delete-product-options.js.map