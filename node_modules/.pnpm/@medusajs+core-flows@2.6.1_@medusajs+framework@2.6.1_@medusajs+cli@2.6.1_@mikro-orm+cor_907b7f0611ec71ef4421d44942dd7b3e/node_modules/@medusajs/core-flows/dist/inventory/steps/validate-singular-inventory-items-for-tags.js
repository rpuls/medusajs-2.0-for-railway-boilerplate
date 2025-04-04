"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInventoryItemsForCreate = exports.validateInventoryItemsForCreateStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.validateInventoryItemsForCreateStepId = "validate-inventory-items-for-create-step";
/**
 * This step checks whether a variant already has an inventory item.
 * If so, the step will throw an error.
 *
 * @example
 * const data = validateInventoryItemsForCreate([
 *   {
 *     tag: "variant_123"
 *   }
 * ])
 */
exports.validateInventoryItemsForCreate = (0, workflows_sdk_1.createStep)(exports.validateInventoryItemsForCreateStepId, async (input, { container }) => {
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const linkService = remoteLink.getLinkModule(utils_1.Modules.PRODUCT, "variant_id", utils_1.Modules.INVENTORY, "inventory_item_id");
    const existingItems = await linkService.list({ variant_id: input.map((i) => i.tag) }, { select: ["variant_id", "inventory_item_id"] });
    if (existingItems.length) {
        // @ts-expect-error
        const ids = existingItems.map((i) => i.variant_id).join(", ");
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Inventory items already exist for variants with ids: ${ids}`);
    }
    return new workflows_sdk_1.StepResponse(input);
});
//# sourceMappingURL=validate-singular-inventory-items-for-tags.js.map