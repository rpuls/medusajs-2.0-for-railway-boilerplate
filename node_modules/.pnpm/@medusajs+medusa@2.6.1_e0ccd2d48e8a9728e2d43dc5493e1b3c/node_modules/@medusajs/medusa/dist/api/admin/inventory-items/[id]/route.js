"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../helpers");
const GET = async (req, res) => {
    const { id } = req.params;
    const inventoryItem = await (0, helpers_1.refetchInventoryItem)(id, req.scope, req.queryConfig.fields);
    if (!inventoryItem) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Inventory item with id: ${id} was not found`);
    }
    res.status(200).json({
        inventory_item: inventoryItem,
    });
};
exports.GET = GET;
// Update inventory item
const POST = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.updateInventoryItemsWorkflow)(req.scope).run({
        input: {
            updates: [{ id, ...req.validatedBody }],
        },
    });
    const inventoryItem = await (0, helpers_1.refetchInventoryItem)(id, req.scope, req.queryConfig.fields);
    res.status(200).json({
        inventory_item: inventoryItem,
    });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    const deleteInventoryItems = (0, core_flows_1.deleteInventoryItemWorkflow)(req.scope);
    await deleteInventoryItems.run({
        input: [id],
    });
    res.status(200).json({
        id,
        object: "inventory_item",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map