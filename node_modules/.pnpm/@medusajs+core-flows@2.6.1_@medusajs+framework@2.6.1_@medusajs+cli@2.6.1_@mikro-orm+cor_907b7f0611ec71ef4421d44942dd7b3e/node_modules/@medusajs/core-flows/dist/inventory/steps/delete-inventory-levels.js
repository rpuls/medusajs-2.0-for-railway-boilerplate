"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInventoryLevelsStep = exports.deleteInventoryLevelsStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.deleteInventoryLevelsStepId = "delete-inventory-levels-step";
/**
 * This step deletes one or more inventory levels.
 */
exports.deleteInventoryLevelsStep = (0, workflows_sdk_1.createStep)(exports.deleteInventoryLevelsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.INVENTORY);
    await service.softDeleteInventoryLevels(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevLevelIds, { container }) => {
    if (!prevLevelIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.INVENTORY);
    await service.restoreInventoryLevels(prevLevelIds);
});
//# sourceMappingURL=delete-inventory-levels.js.map