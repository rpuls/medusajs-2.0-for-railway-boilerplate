"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLineItemPricesStep = exports.validateLineItemPricesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.validateLineItemPricesStepId = "validate-line-item-prices";
/**
 * This step validates the specified line item objects to ensure they have prices.
 * If an item doesn't have a price, the step throws an error.
 *
 * @example
 * const data = validateLineItemPricesStep({
 *   items: [
 *     {
 *       unit_price: 10,
 *       title: "Shirt"
 *     },
 *     {
 *       title: "Pants"
 *     }
 *   ]
 * })
 */
exports.validateLineItemPricesStep = (0, workflows_sdk_1.createStep)(exports.validateLineItemPricesStepId, async (data, { container }) => {
    if (!data.items?.length) {
        return;
    }
    const priceNotFound = [];
    for (const item of data.items) {
        if (!(0, utils_1.isPresent)(item?.unit_price)) {
            priceNotFound.push(item.title);
        }
    }
    if (priceNotFound.length > 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Items ${priceNotFound.join(", ")} do not have a price`);
    }
});
//# sourceMappingURL=validate-line-item-prices.js.map