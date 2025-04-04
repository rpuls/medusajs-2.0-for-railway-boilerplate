"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertVariantPricesWorkflow = exports.upsertVariantPricesWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const pricing_1 = require("../../pricing");
const steps_1 = require("../steps");
exports.upsertVariantPricesWorkflowId = "upsert-variant-prices";
/**
 * This workflow creates, updates, or removes variants' prices. It's used by the {@link updateProductsWorkflow}
 * when updating a variant's prices.
 *
 * You can use this workflow within your own customizations or custom workflows to manage the prices of a variant.
 *
 * @example
 * const { result } = await upsertVariantPricesWorkflow(container)
 * .run({
 *   input: {
 *     variantPrices: [
 *       {
 *         variant_id: "variant_123",
 *         product_id: "prod_123",
 *         prices: [
 *           {
 *             amount: 10,
 *             currency_code: "usd",
 *           },
 *           {
 *             id: "price_123",
 *             amount: 20,
 *           }
 *         ]
 *       }
 *     ],
 *     // these are variants to remove all their prices
 *     // typically used when a variant is deleted.
 *     previousVariantIds: ["variant_321"]
 *   }
 * })
 *
 * @summary
 *
 * Create, update, or remove variants' prices.
 */
exports.upsertVariantPricesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.upsertVariantPricesWorkflowId, (input) => {
    const removedVariantIds = (0, workflows_sdk_1.transform)({ input }, (data) => {
        return (0, utils_1.arrayDifference)(data.input.previousVariantIds, data.input.variantPrices.map((v) => v.variant_id));
    });
    (0, common_1.removeRemoteLinkStep)({
        [utils_1.Modules.PRODUCT]: { variant_id: removedVariantIds },
    }).config({ name: "remove-variant-link-step" });
    const { newVariants, existingVariants } = (0, workflows_sdk_1.transform)({ input }, (data) => {
        const previousMap = new Set(data.input.previousVariantIds.map((v) => v));
        return {
            existingVariants: data.input.variantPrices.filter((v) => previousMap.has(v.variant_id)),
            newVariants: data.input.variantPrices.filter((v) => !previousMap.has(v.variant_id)),
        };
    });
    const existingVariantIds = (0, workflows_sdk_1.transform)({ existingVariants }, (data) => data.existingVariants.map((v) => v.variant_id));
    const existingLinks = (0, common_1.useRemoteQueryStep)({
        entry_point: "product_variant_price_set",
        fields: ["variant_id", "price_set_id"],
        variables: { filters: { variant_id: existingVariantIds } },
    });
    const pricesToUpdate = (0, workflows_sdk_1.transform)({ existingVariants, existingLinks }, (data) => {
        const linksMap = new Map(data.existingLinks.map((l) => [l.variant_id, l.price_set_id]));
        return {
            price_sets: data.existingVariants
                .map((v) => {
                const priceSetId = linksMap.get(v.variant_id);
                if (!priceSetId || !v.prices) {
                    return;
                }
                return {
                    id: priceSetId,
                    prices: v.prices,
                };
            })
                .filter(Boolean),
        };
    });
    (0, pricing_1.updatePriceSetsStep)(pricesToUpdate);
    // Note: We rely on the same order of input and output when creating variants here, make sure that assumption holds
    const pricesToCreate = (0, workflows_sdk_1.transform)({ newVariants }, (data) => data.newVariants.map((v) => {
        return {
            prices: v.prices,
        };
    }));
    const createdPriceSets = (0, pricing_1.createPriceSetsStep)(pricesToCreate);
    const variantAndPriceSetLinks = (0, workflows_sdk_1.transform)({ newVariants, createdPriceSets }, (data) => {
        return {
            links: data.newVariants.map((variant, i) => ({
                variant_id: variant.variant_id,
                price_set_id: data.createdPriceSets[i].id,
            })),
        };
    });
    (0, steps_1.createVariantPricingLinkStep)(variantAndPriceSetLinks);
});
//# sourceMappingURL=upsert-variant-prices.js.map