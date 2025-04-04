"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachInventoryItemToVariants = exports.attachInventoryItemToVariantsStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.attachInventoryItemToVariantsStepId = "attach-inventory-items-to-variants-step";
/**
 * This step creates one or more links between variant and inventory item records.
 *
 * @example
 * const data = attachInventoryItemToVariants([
 *   {
 *     inventoryItemId: "iitem_123",
 *     tag: "variant_123"
 *   }
 * ])
 */
exports.attachInventoryItemToVariants = (0, workflows_sdk_1.createStep)(exports.attachInventoryItemToVariantsStepId, async (input, { container }) => {
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const linkDefinitions = input
        .filter(({ tag }) => !!tag)
        .map(({ inventoryItemId, tag }) => ({
        [utils_1.Modules.PRODUCT]: {
            variant_id: tag,
        },
        [utils_1.Modules.INVENTORY]: {
            inventory_item_id: inventoryItemId,
        },
    }));
    const links = await remoteLink.create(linkDefinitions);
    return new workflows_sdk_1.StepResponse(links, linkDefinitions);
}, async (linkDefinitions, { container }) => {
    if (!linkDefinitions?.length) {
        return;
    }
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    await remoteLink.dismiss(linkDefinitions);
});
//# sourceMappingURL=attach-inventory-items.js.map