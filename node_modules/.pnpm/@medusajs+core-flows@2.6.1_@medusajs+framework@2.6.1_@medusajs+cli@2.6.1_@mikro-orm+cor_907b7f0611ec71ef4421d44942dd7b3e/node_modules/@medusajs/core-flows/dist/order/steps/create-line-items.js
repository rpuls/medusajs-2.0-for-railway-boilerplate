"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderLineItemsStep = exports.createOrderLineItemsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createOrderLineItemsStepId = "create-order-line-items-step";
/**
 * This step creates order line items.
 *
 * @example
 * const data = createOrderLineItemsStep({
 *   items: [
 *     {
 *       variant_id: "variant_123",
 *       quantity: 1,
 *       unit_price: 10,
 *       title: "Shirt",
 *       order_id: "order_123"
 *     }
 *   ]
 * })
 */
exports.createOrderLineItemsStep = (0, workflows_sdk_1.createStep)(exports.createOrderLineItemsStepId, async (input, { container }) => {
    const orderModule = container.resolve(utils_1.Modules.ORDER);
    const createdItems = input.items.length
        ? await orderModule.createOrderLineItems(input.items)
        : [];
    return new workflows_sdk_1.StepResponse(createdItems, createdItems.map((c) => c.id));
}, async (itemIds, { container }) => {
    if (!itemIds?.length) {
        return;
    }
    const orderModule = container.resolve(utils_1.Modules.ORDER);
    await orderModule.deleteOrderLineItems(itemIds);
});
//# sourceMappingURL=create-line-items.js.map