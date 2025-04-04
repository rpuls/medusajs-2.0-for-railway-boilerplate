"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLineItemsStep = exports.createLineItemsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createLineItemsStepId = "create-line-items-step";
/**
 * This step creates line item in a cart.
 *
 * @example
 * const data = createLineItemsStep({
 *   "id": "cart_123",
 *   "items": [{
 *     "title": "Shirt",
 *     "quantity": 1,
 *     "unit_price": 20,
 *     "cart_id": "cart_123",
 *   }]
 * })
 */
exports.createLineItemsStep = (0, workflows_sdk_1.createStep)(exports.createLineItemsStepId, async (data, { container }) => {
    const cartModule = container.resolve(utils_1.Modules.CART);
    const createdItems = data.items.length
        ? await cartModule.addLineItems(data.items)
        : [];
    return new workflows_sdk_1.StepResponse(createdItems, createdItems);
}, async (createdItems, { container }) => {
    if (!createdItems?.length) {
        return;
    }
    const cartModule = container.resolve(utils_1.Modules.CART);
    await cartModule.deleteLineItems(createdItems.map((c) => c.id));
});
//# sourceMappingURL=create-line-items.js.map