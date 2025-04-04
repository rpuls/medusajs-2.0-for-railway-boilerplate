"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductOptionsStep = exports.createProductOptionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createProductOptionsStepId = "create-product-options";
/**
 * This step creates one or more product options.
 *
 * @example
 * const data = createProductOptionsStep([{
 *   title: "Size",
 *   values: ["S", "M", "L"]
 * }])
 */
exports.createProductOptionsStep = (0, workflows_sdk_1.createStep)(exports.createProductOptionsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    const created = await service.createProductOptions(data);
    return new workflows_sdk_1.StepResponse(created, created.map((productOption) => productOption.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PRODUCT);
    await service.deleteProductOptions(createdIds);
});
//# sourceMappingURL=create-product-options.js.map