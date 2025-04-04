"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariantsStep = exports.getVariantsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.getVariantsStepId = "get-variants";
/**
 * This step retrieves variants matching the specified filters.
 *
 * @example
 * const data = getVariantsStep({
 *   filter: {
 *     id: "variant_123"
 *   }
 * })
 */
exports.getVariantsStep = (0, workflows_sdk_1.createStep)(exports.getVariantsStepId, async (data, { container }) => {
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    const variants = await productModuleService.listProductVariants(data.filter, data.config);
    return new workflows_sdk_1.StepResponse(variants);
});
//# sourceMappingURL=get-variants.js.map