"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariantPriceSetsStep = exports.getVariantPriceSetsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.getVariantPriceSetsStepId = "get-variant-price-sets";
/**
 * This step retrieves the calculated price sets of the specified variants.
 *
 * @example
 * To retrieve a variant's price sets:
 *
 * ```ts
 * const data = getVariantPriceSetsStep({
 *   variantIds: ["variant_123"],
 * })
 * ```
 *
 * To retrieve the calculated price sets of a variant:
 *
 * ```ts
 * const data = getVariantPriceSetsStep({
 *   variantIds: ["variant_123"],
 *   context: {
 *     currency_code: "usd"
 *   }
 * })
 * ```
 */
exports.getVariantPriceSetsStep = (0, workflows_sdk_1.createStep)(exports.getVariantPriceSetsStepId, async (data, { container }) => {
    if (!data.variantIds.length) {
        return new workflows_sdk_1.StepResponse({});
    }
    const pricingModuleService = container.resolve(utils_1.Modules.PRICING);
    const remoteQuery = container.resolve("remoteQuery");
    const variantPriceSets = await remoteQuery({
        entryPoint: "variant",
        fields: ["id", "price_set.id"],
        variables: {
            id: data.variantIds,
        },
    });
    const notFound = [];
    const priceSetIds = [];
    variantPriceSets.forEach((v) => {
        if (v.price_set?.id) {
            priceSetIds.push(v.price_set.id);
        }
        else {
            notFound.push(v.id);
        }
    });
    if (notFound.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Variants with IDs ${notFound.join(", ")} do not have a price`);
    }
    const calculatedPriceSets = await pricingModuleService.calculatePrices({ id: priceSetIds }, { context: data.context });
    const idToPriceSet = new Map(calculatedPriceSets.map((p) => [p.id, p]));
    const variantToCalculatedPriceSets = variantPriceSets.reduce((acc, { id, price_set }) => {
        const calculatedPriceSet = idToPriceSet.get(price_set?.id);
        if (calculatedPriceSet) {
            acc[id] = calculatedPriceSet;
        }
        return acc;
    }, {});
    return new workflows_sdk_1.StepResponse(variantToCalculatedPriceSets);
});
//# sourceMappingURL=get-variant-price-sets.js.map