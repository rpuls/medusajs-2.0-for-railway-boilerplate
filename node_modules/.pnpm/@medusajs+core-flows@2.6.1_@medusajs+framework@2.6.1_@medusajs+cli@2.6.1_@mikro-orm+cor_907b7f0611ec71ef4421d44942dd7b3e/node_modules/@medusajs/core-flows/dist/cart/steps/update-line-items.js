"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLineItemsStep = exports.updateLineItemsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateLineItemsStepId = "update-line-items-step";
/**
 * This step updates a cart's line items.
 *
 * @example
 * const data = updateLineItemsStep({
 *   id: "cart_123",
 *   items: [
 *     {
 *       selector: {
 *         id: "line_item_123"
 *       },
 *       data: {
 *         quantity: 2
 *       }
 *     }
 *   ]
 * })
 */
exports.updateLineItemsStep = (0, workflows_sdk_1.createStep)(exports.updateLineItemsStepId, async (input, { container }) => {
    const { items = [] } = input;
    if (!items?.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const cartModule = container.resolve(utils_1.Modules.CART);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(items.map((item) => ("data" in item ? item.data : item)));
    const itemsBeforeUpdate = await cartModule.listLineItems({ id: items.map((d) => ("selector" in d ? d.selector.id : d.id)) }, { select: selects, relations });
    const updatedItems = items.length
        ? await cartModule.updateLineItems(items)
        : [];
    return new workflows_sdk_1.StepResponse(updatedItems, itemsBeforeUpdate);
}, async (itemsBeforeUpdate, { container }) => {
    if (!itemsBeforeUpdate?.length) {
        return;
    }
    const cartModule = container.resolve(utils_1.Modules.CART);
    if (itemsBeforeUpdate.length) {
        const itemsToUpdate = [];
        for (const item of itemsBeforeUpdate) {
            const { id, ...data } = item;
            itemsToUpdate.push({ selector: { id }, data });
        }
        await cartModule.updateLineItems(itemsToUpdate);
    }
});
//# sourceMappingURL=update-line-items.js.map