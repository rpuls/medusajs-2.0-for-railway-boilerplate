"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductTypesStep = exports.createProductTypesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createProductTypesStepId = "create-product-types";
/**
 * This step creates one or more product types.
 */
exports.createProductTypesStep = (0, workflows_sdk_1.createStep)(exports.createProductTypesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    const created = await service.createProductTypes(data);
    return new workflows_sdk_1.StepResponse(created, created.map((productType) => productType.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.deleteProductTypes(createdIds);
});
//# sourceMappingURL=create-product-types.js.map