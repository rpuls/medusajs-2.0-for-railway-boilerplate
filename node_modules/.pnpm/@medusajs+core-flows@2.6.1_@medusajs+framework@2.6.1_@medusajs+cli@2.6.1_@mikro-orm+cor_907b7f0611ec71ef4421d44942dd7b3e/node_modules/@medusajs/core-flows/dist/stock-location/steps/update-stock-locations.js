"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStockLocationsStep = exports.updateStockLocationsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_2 = require("@medusajs/framework/utils");
exports.updateStockLocationsStepId = "update-stock-locations-step";
/**
 * This step updates stock locations matching the specified filters.
 *
 * @example
 * const data = updateStockLocationsStep({
 *   selector: {
 *     id: "sloc_123"
 *   },
 *   update: {
 *     name: "European Warehouse"
 *   }
 * })
 */
exports.updateStockLocationsStep = (0, workflows_sdk_1.createStep)(exports.updateStockLocationsStepId, async (input, { container }) => {
    const stockLocationService = container.resolve(utils_2.Modules.STOCK_LOCATION);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        input.update,
    ]);
    const dataBeforeUpdate = await stockLocationService.listStockLocations(input.selector, {
        select: selects,
        relations,
    });
    const updatedStockLocations = await stockLocationService.updateStockLocations(input.selector, input.update);
    return new workflows_sdk_1.StepResponse(updatedStockLocations, dataBeforeUpdate);
}, async (revertInput, { container }) => {
    if (!revertInput?.length) {
        return;
    }
    const stockLocationService = container.resolve(utils_2.Modules.STOCK_LOCATION);
    await stockLocationService.upsertStockLocations(revertInput.map((item) => ({
        id: item.id,
        name: item.name,
        ...(item.metadata ? { metadata: item.metadata } : {}),
        ...(item.address ? { address: item.address } : {}),
    })));
});
//# sourceMappingURL=update-stock-locations.js.map