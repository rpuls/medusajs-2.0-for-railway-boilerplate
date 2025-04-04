"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const apply_decorators_1 = require("../utils/apply-decorators");
const _models_1 = require("../models");
class InventoryLevelService extends utils_1.ModulesSdkUtils.MedusaInternalService(_models_1.InventoryLevel) {
    constructor(container) {
        super(container);
        this.inventoryLevelRepository = container.inventoryLevelRepository;
    }
    async retrieveStockedQuantity(inventoryItemId, locationIds, context = {}) {
        const locationIdArray = Array.isArray(locationIds)
            ? locationIds
            : [locationIds];
        return await this.inventoryLevelRepository.getStockedQuantity(inventoryItemId, locationIdArray, context);
    }
    async getAvailableQuantity(inventoryItemId, locationIds, context = {}) {
        const locationIdArray = Array.isArray(locationIds)
            ? locationIds
            : [locationIds];
        return await this.inventoryLevelRepository.getAvailableQuantity(inventoryItemId, locationIdArray, context);
    }
    async getReservedQuantity(inventoryItemId, locationIds, context = {}) {
        if (!Array.isArray(locationIds)) {
            locationIds = [locationIds];
        }
        return await this.inventoryLevelRepository.getReservedQuantity(inventoryItemId, locationIds, context);
    }
}
exports.default = InventoryLevelService;
(0, apply_decorators_1.applyEntityHooks)();
//# sourceMappingURL=inventory-level.js.map