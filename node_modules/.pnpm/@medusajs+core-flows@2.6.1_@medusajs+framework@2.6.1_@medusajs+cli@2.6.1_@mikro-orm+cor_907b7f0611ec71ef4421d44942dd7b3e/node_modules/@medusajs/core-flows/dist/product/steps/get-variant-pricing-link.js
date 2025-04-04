"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariantPricingLinkStep = exports.getVariantPricingLinkStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.getVariantPricingLinkStepId = "get-variant-pricing-link";
/**
 * This step retrieves links between a product variant and its linked price sets.
 */
exports.getVariantPricingLinkStep = (0, workflows_sdk_1.createStep)(exports.getVariantPricingLinkStepId, async (data, { container }) => {
    if (!data.ids.length) {
        return new workflows_sdk_1.StepResponse([]);
    }
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const linkService = remoteLink.getLinkModule(utils_1.Modules.PRODUCT, "variant_id", utils_1.Modules.PRICING, "price_set_id");
    const existingItems = (await linkService.list({ variant_id: data.ids }, { select: ["variant_id", "price_set_id"] }));
    if (existingItems.length !== data.ids.length) {
        const missing = (0, utils_1.arrayDifference)(data.ids, existingItems.map((i) => i.variant_id));
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Variants with IDs ${missing.join(", ")} do not have prices associated.`);
    }
    return new workflows_sdk_1.StepResponse(existingItems);
});
//# sourceMappingURL=get-variant-pricing-link.js.map