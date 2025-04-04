"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInventoryLevelsStep = exports.updateInventoryLevelsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_2 = require("@medusajs/framework/utils");
exports.updateInventoryLevelsStepId = "update-inventory-levels-step";
/**
 * This step updates one or more inventory levels.
 */
exports.updateInventoryLevelsStep = (0, workflows_sdk_1.createStep)(exports.updateInventoryLevelsStepId, async (input, { container }) => {
    const inventoryService = container.resolve(utils_2.Modules.INVENTORY);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(input);
    const dataBeforeUpdate = await inventoryService.listInventoryLevels({
        $or: input.map(({ inventory_item_id, location_id }) => ({
            inventory_item_id,
            location_id,
        })),
    }, {});
    const updatedLevels = await inventoryService.updateInventoryLevels(input);
    return new workflows_sdk_1.StepResponse(updatedLevels, {
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
    await inventoryService.updateInventoryLevels(dataBeforeUpdate.map((data) => (0, utils_1.convertItemResponseToUpdateRequest)(data, selects, relations)));
});
//# sourceMappingURL=update-inventory-levels.js.map