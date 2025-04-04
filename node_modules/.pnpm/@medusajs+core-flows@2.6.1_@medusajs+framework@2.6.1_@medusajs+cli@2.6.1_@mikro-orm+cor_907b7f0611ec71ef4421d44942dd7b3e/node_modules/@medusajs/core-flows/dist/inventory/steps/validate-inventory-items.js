"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInventoryItems = exports.validateInventoryItemsId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.validateInventoryItemsId = "validate-inventory-items-step";
/**
 * This step ensures that the inventory items with the specified IDs exist.
 * If not valid, the step will throw an error.
 */
exports.validateInventoryItems = (0, workflows_sdk_1.createStep)(exports.validateInventoryItemsId, async (id, { container }) => {
    const remoteQuery = container.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const items = await remoteQuery({
        entryPoint: "inventory_item",
        variables: { id },
        fields: ["id"],
    });
    const diff = (0, utils_1.arrayDifference)(id, items.map(({ id }) => id));
    if (diff.length > 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Inventory Items with ids: ${diff.join(", ")} was not found`);
    }
});
//# sourceMappingURL=validate-inventory-items.js.map