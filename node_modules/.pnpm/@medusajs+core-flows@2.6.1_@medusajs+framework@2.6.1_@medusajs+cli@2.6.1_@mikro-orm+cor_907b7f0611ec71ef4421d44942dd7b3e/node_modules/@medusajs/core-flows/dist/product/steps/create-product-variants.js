"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductVariantsStep = exports.createProductVariantsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createProductVariantsStepId = "create-product-variants";
/**
 * This step creates one or more product variants.
 *
 * @example
 * const data = createProductVariantsStep([{
 *   title: "Small Shirt",
 *   options: {
 *     Size: "S",
 *   },
 *   product_id: "prod_123",
 * }])
 */
exports.createProductVariantsStep = (0, workflows_sdk_1.createStep)(exports.createProductVariantsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    const created = await service.createProductVariants(data);
    return new workflows_sdk_1.StepResponse(created, created.map((productVariant) => productVariant.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.deleteProductVariants(createdIds);
});
//# sourceMappingURL=create-product-variants.js.map