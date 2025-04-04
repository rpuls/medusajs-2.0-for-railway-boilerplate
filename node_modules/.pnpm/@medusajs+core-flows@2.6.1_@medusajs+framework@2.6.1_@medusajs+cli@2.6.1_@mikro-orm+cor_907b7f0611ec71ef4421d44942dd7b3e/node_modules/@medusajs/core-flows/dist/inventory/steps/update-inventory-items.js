"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInventoryItemsStep = exports.updateInventoryItemsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_2 = require("@medusajs/framework/utils");
exports.updateInventoryItemsStepId = "update-inventory-items-step";
/**
 * This step updates one or more inventory items.
 */
exports.updateInventoryItemsStep = (0, workflows_sdk_1.createStep)(exports.updateInventoryItemsStepId, async (input, { container }) => {
    const inventoryService = container.resolve(utils_2.Modules.INVENTORY);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(input);
    const dataBeforeUpdate = await inventoryService.listInventoryItems({ id: input.map(({ id }) => id) }, {});
    const updatedInventoryItems = await inventoryService.updateInventoryItems(input);
    return new workflows_sdk_1.StepResponse(updatedInventoryItems, {
        dataBeforeUpdate,
        selects,
        relations,
    });
}, async (revertInput, { container }) => {
    if (!revertInput?.dataBeforeUpdate?.length) {
        return;
    }
    const { dataBeforeUpdate, selects, relations } = revertInput;
    const inventoryService = container.resolve(utils_2.Modules.INVENTORY);
    await inventoryService.updateInventoryItems(dataBeforeUpdate.map((data) => (0, utils_1.convertItemResponseToUpdateRequest)(data, selects, relations)));
});
//# sourceMappingURL=update-inventory-items.js.map