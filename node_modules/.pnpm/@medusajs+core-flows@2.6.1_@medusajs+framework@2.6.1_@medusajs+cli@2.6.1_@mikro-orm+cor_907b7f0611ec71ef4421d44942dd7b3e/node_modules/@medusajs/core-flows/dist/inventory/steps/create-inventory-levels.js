"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInventoryLevelsStep = exports.createInventoryLevelsStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.createInventoryLevelsStepId = "create-inventory-levels";
/**
 * This step creates one or more inventory levels.
 */
exports.createInventoryLevelsStep = (0, workflows_sdk_1.createStep)(exports.createInventoryLevelsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.INVENTORY);
    const inventoryLevels = await service.createInventoryLevels(data);
    return new workflows_sdk_1.StepResponse(inventoryLevels, inventoryLevels.map((level) => level.id));
}, async (ids, { container }) => {
    if (!ids?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.INVENTORY);
    await service.deleteInventoryLevels(ids);
});
//# sourceMappingURL=create-inventory-levels.js.map