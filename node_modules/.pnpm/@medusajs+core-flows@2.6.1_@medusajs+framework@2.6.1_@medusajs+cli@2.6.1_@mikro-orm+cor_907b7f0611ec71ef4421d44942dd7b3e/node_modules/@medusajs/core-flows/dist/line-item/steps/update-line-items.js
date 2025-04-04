"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLineItemsStepWithSelector = exports.updateLineItemsStepWithSelectorId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateLineItemsStepWithSelectorId = "update-line-items-with-selector";
/**
 * This step updates line items.
 *
 * @example
 * const data = updateLineItemsStepWithSelector({
 *   selector: {
 *     cart_id: "cart_123"
 *   },
 *   data: {
 *     quantity: 1
 *   }
 * })
 */
exports.updateLineItemsStepWithSelector = (0, workflows_sdk_1.createStep)(exports.updateLineItemsStepWithSelectorId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.CART);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        input.data,
    ]);
    const itemsBefore = await service.listLineItems(input.selector, {
        select: selects,
        relations,
    });
    const items = await service.updateLineItems(input.selector, input.data);
    return new workflows_sdk_1.StepResponse(items, itemsBefore);
}, async (itemsBefore, { container }) => {
    if (!itemsBefore) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CART);
    await (0, utils_1.promiseAll)(itemsBefore.map(async (i) => service.updateLineItems(i.id, (0, utils_1.removeUndefined)({
        quantity: i.quantity,
        title: i.title,
        metadata: i.metadata,
        unit_price: i.unit_price,
        tax_lines: i.tax_lines,
        adjustments: i.adjustments,
    }))));
});
//# sourceMappingURL=update-line-items.js.map