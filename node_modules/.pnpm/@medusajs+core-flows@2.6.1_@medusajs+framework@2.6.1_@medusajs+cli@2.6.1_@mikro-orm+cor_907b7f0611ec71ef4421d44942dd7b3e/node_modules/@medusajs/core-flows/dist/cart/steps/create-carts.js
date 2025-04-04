"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCartsStep = exports.createCartsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createCartsStepId = "create-carts";
/**
 * This step creates a cart.
 */
exports.createCartsStep = (0, workflows_sdk_1.createStep)(exports.createCartsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.CART);
    const createdCarts = await service.createCarts(data);
    return new workflows_sdk_1.StepResponse(createdCarts, createdCarts.map((cart) => cart.id));
}, async (createdCartsIds, { container }) => {
    if (!createdCartsIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CART);
    await service.deleteCarts(createdCartsIds);
});
//# sourceMappingURL=create-carts.js.map