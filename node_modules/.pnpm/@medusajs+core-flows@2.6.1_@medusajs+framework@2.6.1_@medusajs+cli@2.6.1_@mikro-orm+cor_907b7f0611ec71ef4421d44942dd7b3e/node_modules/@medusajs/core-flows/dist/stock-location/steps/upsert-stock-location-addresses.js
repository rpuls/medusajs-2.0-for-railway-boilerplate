"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertStockLocationAddressesStep = exports.upsertStockLocationAddressesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_2 = require("@medusajs/framework/utils");
exports.upsertStockLocationAddressesStepId = "upsert-stock-location-addresses-step";
/**
 * This step upserts stock location addresses matching the specified filters.
 */
exports.upsertStockLocationAddressesStep = (0, workflows_sdk_1.createStep)(exports.upsertStockLocationAddressesStepId, async (input, { container }) => {
    const stockLocationService = container.resolve(utils_2.Modules.STOCK_LOCATION);
    const stockLocationAddressIds = input.map((i) => i.id).filter(Boolean);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(input);
    const dataToUpdate = await stockLocationService.listStockLocationAddresses({ id: stockLocationAddressIds }, { select: selects, relations });
    const updateIds = dataToUpdate.map((du) => du.id);
    const updatedAddresses = await stockLocationService.upsertStockLocationAddresses(input);
    const dataToDelete = updatedAddresses.filter((address) => !updateIds.includes(address.id));
    return new workflows_sdk_1.StepResponse(updatedAddresses, { dataToUpdate, dataToDelete });
}, async (revertData, { container }) => {
    if (!revertData) {
        return;
    }
    const stockLocationService = container.resolve(utils_2.Modules.STOCK_LOCATION);
    const promises = [];
    if (revertData.dataToDelete) {
        promises.push(stockLocationService.deleteStockLocationAddresses(revertData.dataToDelete.map((d) => d.id)));
    }
    if (revertData.dataToUpdate) {
        promises.push(stockLocationService.upsertStockLocationAddresses(revertData.dataToUpdate));
    }
    await (0, utils_1.promiseAll)(promises);
});
//# sourceMappingURL=upsert-stock-location-addresses.js.map