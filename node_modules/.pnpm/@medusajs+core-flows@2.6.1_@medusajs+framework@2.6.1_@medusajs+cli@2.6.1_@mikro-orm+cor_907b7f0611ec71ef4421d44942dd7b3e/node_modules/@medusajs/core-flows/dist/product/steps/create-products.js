"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductsStep = exports.createProductsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createProductsStepId = "create-products";
/**
 * This step creates one or more products.
 *
 * @example
 * const data = createProductsStep([{
 *   title: "Shirt",
 *   options: [
 *     {
 *       title: "Size",
 *       values: ["S", "M", "L"]
 *     }
 *   ],
 *   variants: [
 *     {
 *       title: "Small Shirt",
 *       options: {
 *         Size: "S"
 *       }
 *     }
 *   ]
 * }])
 */
exports.createProductsStep = (0, workflows_sdk_1.createStep)(exports.createProductsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    const created = await service.createProducts(data);
    return new workflows_sdk_1.StepResponse(created, created.map((product) => product.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.deleteProducts(createdIds);
});
//# sourceMappingURL=create-products.js.map