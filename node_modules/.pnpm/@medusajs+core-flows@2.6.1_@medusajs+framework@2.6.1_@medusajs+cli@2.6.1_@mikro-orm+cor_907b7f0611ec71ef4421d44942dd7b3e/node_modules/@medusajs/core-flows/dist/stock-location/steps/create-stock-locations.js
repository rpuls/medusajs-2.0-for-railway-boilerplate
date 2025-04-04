"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStockLocations = exports.createStockLocationsStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.createStockLocationsStepId = "create-stock-locations";
/**
 * This step creates one or more stock locations.
 */
exports.createStockLocations = (0, workflows_sdk_1.createStep)(exports.createStockLocationsStepId, async (data, { container }) => {
    const stockLocationService = container.resolve(utils_1.Modules.STOCK_LOCATION);
    const created = await stockLocationService.createStockLocations(data);
    return new workflows_sdk_1.StepResponse(created, created.map((i) => i.id));
}, async (createdStockLocationIds, { container }) => {
    if (!createdStockLocationIds?.length) {
        return;
    }
    const stockLocationService = container.resolve(utils_1.Modules.STOCK_LOCATION);
    await stockLocationService.deleteStockLocations(createdStockLocationIds);
});
//# sourceMappingURL=create-stock-locations.js.map