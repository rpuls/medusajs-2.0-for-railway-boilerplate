"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryLevelRepository = void 0;
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
class InventoryLevelRepository extends (0, utils_1.mikroOrmBaseRepositoryFactory)(_models_1.InventoryLevel) {
    async getReservedQuantity(inventoryItemId, locationIds, context = {}) {
        const manager = super.getActiveManager(context);
        const result = await manager
            .getKnex()({ il: "inventory_level" })
            .select("raw_reserved_quantity")
            .whereIn("location_id", locationIds)
            .andWhere("inventory_item_id", inventoryItemId)
            .andWhereRaw("deleted_at IS NULL");
        return new utils_1.BigNumber(utils_1.MathBN.sum(...result.map((r) => r.raw_reserved_quantity)));
    }
    async getAvailableQuantity(inventoryItemId, locationIds, context = {}) {
        const knex = super.getActiveManager(context).getKnex();
        const result = await knex({
            il: "inventory_level",
        })
            .select("raw_stocked_quantity", "raw_reserved_quantity")
            .whereIn("location_id", locationIds)
            .andWhere("inventory_item_id", inventoryItemId)
            .andWhereRaw("deleted_at IS NULL");
        return new utils_1.BigNumber(utils_1.MathBN.sum(...result.map((r) => {
            return utils_1.MathBN.sub(r.raw_stocked_quantity, r.raw_reserved_quantity);
        })));
    }
    async getStockedQuantity(inventoryItemId, locationIds, context = {}) {
        const knex = super.getActiveManager(context).getKnex();
        const result = await knex({
            il: "inventory_level",
        })
            .select("raw_stocked_quantity")
            .whereIn("location_id", locationIds)
            .andWhere("inventory_item_id", inventoryItemId)
            .andWhereRaw("deleted_at IS NULL");
        return new utils_1.BigNumber(utils_1.MathBN.sum(...result.map((r) => r.raw_stocked_quantity)));
    }
}
exports.InventoryLevelRepository = InventoryLevelRepository;
//# sourceMappingURL=inventory-level.js.map