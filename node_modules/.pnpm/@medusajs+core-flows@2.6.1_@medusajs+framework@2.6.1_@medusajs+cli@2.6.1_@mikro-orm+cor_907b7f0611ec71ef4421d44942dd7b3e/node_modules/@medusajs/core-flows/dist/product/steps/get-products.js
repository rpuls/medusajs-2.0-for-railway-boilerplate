"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductsStep = exports.getProductsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.getProductsStepId = "get-products";
/**
 * This step retrieves products, with ability to filter by product IDs.
 */
exports.getProductsStep = (0, workflows_sdk_1.createStep)(exports.getProductsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PRODUCT);
    if (!data.ids?.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const products = await service.listProducts({ id: data.ids }, { relations: ["variants"] });
    return new workflows_sdk_1.StepResponse(products, products);
});
//# sourceMappingURL=get-products.js.map