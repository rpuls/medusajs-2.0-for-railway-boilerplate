"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.DELETE = void 0;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../../helpers");
const DELETE = async (req, res) => {
    const { id, location_id } = req.params;
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const result = await query.graph({
        entity: "inventory_level",
        filters: { inventory_item_id: id, location_id },
        fields: ["id", "reserved_quantity"],
    });
    if (!result.data.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Inventory Level for Item ${id} at Location ${location_id} not found`);
    }
    const { id: levelId, reserved_quantity: reservedQuantity } = result.data[0];
    if (reservedQuantity > 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Cannot remove Inventory Level ${id} at Location ${location_id} because there are reservations at location`);
    }
    const deleteInventoryLevelWorkflow = (0, core_flows_1.deleteInventoryLevelsWorkflow)(req.scope);
    await deleteInventoryLevelWorkflow.run({
        input: {
            id: [levelId],
        },
    });
    const inventoryItem = await (0, helpers_1.refetchInventoryItem)(id, req.scope, req.queryConfig.fields);
    res.status(200).json({
        id: levelId,
        object: "inventory-level",
        deleted: true,
        parent: inventoryItem,
    });
};
exports.DELETE = DELETE;
const POST = async (req, res) => {
    const { id, location_id } = req.params;
    await (0, core_flows_1.updateInventoryLevelsWorkflow)(req.scope).run({
        input: {
            updates: [{ ...req.validatedBody, inventory_item_id: id, location_id }],
        },
    });
    const inventoryItem = await (0, helpers_1.refetchInventoryItem)(id, req.scope, req.queryConfig.fields);
    res.status(200).json({
        inventory_item: inventoryItem,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map