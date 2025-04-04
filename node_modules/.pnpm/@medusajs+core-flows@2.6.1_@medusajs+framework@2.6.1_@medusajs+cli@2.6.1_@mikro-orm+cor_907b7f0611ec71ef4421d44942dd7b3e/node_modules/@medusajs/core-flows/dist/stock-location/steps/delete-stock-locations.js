"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStockLocationsStep = exports.deleteStockLocationsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteStockLocationsStepId = "delete-stock-locations-step";
/**
 * This step deletes one or more stock locations.
 */
exports.deleteStockLocationsStep = (0, workflows_sdk_1.createStep)(exports.deleteStockLocationsStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.STOCK_LOCATION);
    const softDeletedEntities = await service.softDeleteStockLocations(input);
    return new workflows_sdk_1.StepResponse({
        [utils_1.Modules.STOCK_LOCATION]: softDeletedEntities,
    }, input);
}, async (deletedLocationIds, { container }) => {
    if (!deletedLocationIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.STOCK_LOCATION);
    await service.restoreStockLocations(deletedLocationIds);
});
//# sourceMappingURL=delete-stock-locations.js.map