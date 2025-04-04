"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapVariantsWithInventoryQuantityForSalesChannel = exports.wrapVariantsWithTotalInventoryQuantity = void 0;
const utils_1 = require("@medusajs/framework/utils");
const wrapVariantsWithTotalInventoryQuantity = async (req, variants) => {
    const variantIds = (variants ?? []).map((variant) => variant.id).flat(1);
    if (!variantIds.length) {
        return;
    }
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const availability = await (0, utils_1.getTotalVariantAvailability)(query, {
        variant_ids: variantIds,
    });
    wrapVariants(variants, availability);
};
exports.wrapVariantsWithTotalInventoryQuantity = wrapVariantsWithTotalInventoryQuantity;
const wrapVariantsWithInventoryQuantityForSalesChannel = async (req, variants) => {
    const salesChannelId = req.filterableFields.sales_channel_id;
    const { sales_channel_ids: idsFromPublishableKey = [] } = req.publishable_key_context;
    let channelToUse;
    if (salesChannelId && !Array.isArray(salesChannelId)) {
        channelToUse = salesChannelId;
    }
    if (idsFromPublishableKey.length === 1) {
        channelToUse = idsFromPublishableKey[0];
    }
    if (!channelToUse) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Inventory availability cannot be calculated in the given context. Either provide a sales channel id or configure a single sales channel in the publishable key`);
    }
    variants ??= [];
    const variantIds = variants.map((variant) => variant.id).flat(1);
    if (!variantIds.length) {
        return;
    }
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const availability = await (0, utils_1.getVariantAvailability)(query, {
        variant_ids: variantIds,
        sales_channel_id: channelToUse,
    });
    wrapVariants(variants, availability);
};
exports.wrapVariantsWithInventoryQuantityForSalesChannel = wrapVariantsWithInventoryQuantityForSalesChannel;
const wrapVariants = (variants, availability) => {
    for (const variant of variants) {
        if (!variant.manage_inventory) {
            continue;
        }
        variant.inventory_quantity = availability[variant.id].availability;
    }
};
//# sourceMappingURL=variant-inventory-quantity.js.map