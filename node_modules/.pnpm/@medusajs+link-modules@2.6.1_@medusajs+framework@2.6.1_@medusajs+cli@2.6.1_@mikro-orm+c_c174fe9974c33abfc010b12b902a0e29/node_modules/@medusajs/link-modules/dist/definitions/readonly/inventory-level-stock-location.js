"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryLevelStockLocation = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.InventoryLevelStockLocation = {
    isLink: true,
    isReadOnlyLink: true,
    extends: [
        {
            serviceName: utils_1.Modules.INVENTORY,
            entity: "InventoryLevel",
            relationship: {
                serviceName: utils_1.Modules.STOCK_LOCATION,
                entity: "StockLocation",
                primaryKey: "id",
                foreignKey: "location_id",
                alias: "stock_locations",
                args: {
                    methodSuffix: "StockLocations",
                },
                isList: true,
            },
        },
    ],
};
//# sourceMappingURL=inventory-level-stock-location.js.map