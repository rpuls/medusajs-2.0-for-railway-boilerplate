"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLineItemsStep = exports.listLineItemsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.listLineItemsStepId = "list-line-items";
/**
 * This step retrieves a list of a cart's line items
 * matching the specified filters.
 *
 * @example
 * To retrieve the line items of a cart:
 *
 * ```ts
 * const data = listLineItemsStep({
 *   filters: {
 *     cart_id: "cart_123"
 *   },
 *   config: {
 *     select: ["*"]
 *   }
 * })
 * ```
 *
 * To retrieve the line items of a cart with pagination:
 *
 * ```ts
 * const data = listLineItemsStep({
 *   filters: {
 *     cart_id: "cart_123"
 *   },
 *   config: {
 *     select: ["*"],
 *     skip: 0,
 *     take: 15
 *   }
 * })
 * ```
 *
 * Learn more about listing items in [this service factory reference](https://docs.medusajs.com/resources/service-factory-reference/methods/list).
 */
exports.listLineItemsStep = (0, workflows_sdk_1.createStep)(exports.listLineItemsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.CART);
    const items = await service.listLineItems(data.filters, data.config);
    return new workflows_sdk_1.StepResponse(items);
});
//# sourceMappingURL=list-line-items.js.map