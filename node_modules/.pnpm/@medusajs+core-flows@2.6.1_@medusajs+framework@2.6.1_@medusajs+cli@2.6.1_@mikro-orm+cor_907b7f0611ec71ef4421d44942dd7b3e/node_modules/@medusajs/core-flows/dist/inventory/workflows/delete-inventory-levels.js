"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInventoryLevelsWorkflow = exports.deleteInventoryLevelsWorkflowId = exports.validateInventoryLevelsDelete = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
const common_1 = require("../../common");
const delete_entities_1 = require("../../common/steps/delete-entities");
/**
 * This step validates that inventory levels are deletable. If the
 * inventory levels have reserved or incoming items, or the force
 * flag is not set and the inventory levels have stocked items, the
 * step will throw an error.
 *
 * :::note
 *
 * You can retrieve an inventory level's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = validateInventoryLevelsDelete({
 *   inventoryLevels: [
 *     {
 *       id: "iilev_123",
 *       // other inventory level details...
 *     }
 *   ]
 * })
 */
exports.validateInventoryLevelsDelete = (0, workflows_sdk_1.createStep)("validate-inventory-levels-delete", async function ({ inventoryLevels, force, }) {
    const undeleteableDueToReservation = inventoryLevels.filter((i) => i.reserved_quantity > 0 || i.incoming_quantity > 0);
    if (undeleteableDueToReservation.length) {
        const locationIds = (0, utils_1.deduplicate)(undeleteableDueToReservation.map((item) => item.location_id));
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Cannot remove Inventory Levels for ${locationIds.join(", ")} because there are reserved or incoming items at the locations`);
    }
    const undeleteableDueToStock = inventoryLevels.filter((i) => !force && i.stocked_quantity > 0);
    if (undeleteableDueToStock.length) {
        const locationIds = (0, utils_1.deduplicate)(undeleteableDueToStock.map((item) => item.location_id));
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Cannot remove Inventory Levels for ${locationIds.join(", ")} because there are stocked items at the locations. Use force flag to delete anyway.`);
    }
});
exports.deleteInventoryLevelsWorkflowId = "delete-inventory-levels-workflow";
/**
 * This workflow deletes one or more inventory levels. It's used by the
 * [Delete Inventory Levels Admin API Route](https://docs.medusajs.com/api/admin#inventory-items_deleteinventoryitemsidlocationlevelslocation_id).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to delete inventory levels in your custom flows.
 *
 * @example
 * const { result } = await deleteInventoryLevelsWorkflow(container)
 * .run({
 *   input: {
 *     id: ["iilev_123", "iilev_321"],
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more inventory levels.
 */
exports.deleteInventoryLevelsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteInventoryLevelsWorkflowId, (input) => {
    const { filters, force } = (0, workflows_sdk_1.transform)(input, (data) => {
        const { force, ...filters } = data;
        return {
            filters,
            force,
        };
    });
    const inventoryLevels = (0, common_1.useRemoteQueryStep)({
        entry_point: "inventory_levels",
        fields: ["id", "stocked_quantity", "reserved_quantity", "location_id"],
        variables: {
            filters: filters,
        },
    });
    (0, exports.validateInventoryLevelsDelete)({ inventoryLevels, force });
    const idsToDelete = (0, workflows_sdk_1.transform)({ inventoryLevels }, ({ inventoryLevels }) => inventoryLevels.map((il) => il.id));
    (0, delete_entities_1.deleteEntitiesStep)({
        moduleRegistrationName: utils_1.Modules.INVENTORY,
        invokeMethod: "softDeleteInventoryLevels",
        compensateMethod: "restoreInventoryLevels",
        data: idsToDelete,
    });
    return new workflows_sdk_1.WorkflowResponse(void 0);
});
//# sourceMappingURL=delete-inventory-levels.js.map