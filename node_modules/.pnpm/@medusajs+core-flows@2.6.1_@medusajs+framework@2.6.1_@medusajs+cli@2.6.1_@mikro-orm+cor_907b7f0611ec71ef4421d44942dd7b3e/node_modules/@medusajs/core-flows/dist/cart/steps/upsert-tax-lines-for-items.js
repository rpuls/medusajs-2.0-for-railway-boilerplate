"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertTaxLinesForItemsStep = exports.upsertTaxLinesForItemsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.upsertTaxLinesForItemsStepId = "set-tax-lines-for-items";
/**
 * This step sets the tax lines of shipping methods and line items in a cart.
 *
 * :::tip
 *
 * You can use the {@link retrieveCartStep} to retrieve a cart's details.
 *
 * :::
 *
 * @example
 * const data = upsertTaxLinesForItemsStep({
 *   // retrieve the details of the cart from another workflow
 *   // or in another step using the Cart Module's service
 *   cart,
 *   "item_tax_lines": [{
 *     "rate": 48,
 *     "code": "CODE123",
 *     "name": "Tax rate 2",
 *     "provider_id": "provider_1",
 *     "line_item_id": "litem_123"
 *   }],
 *   "shipping_tax_lines": [{
 *     "rate": 49,
 *     "code": "CODE456",
 *     "name": "Tax rate 1",
 *     "provider_id": "provider_1",
 *     "shipping_line_id": "sm_123"
 *   }]
 * })
 */
exports.upsertTaxLinesForItemsStep = (0, workflows_sdk_1.createStep)(exports.upsertTaxLinesForItemsStepId, async (data, { container }) => {
    const { cart, item_tax_lines, shipping_tax_lines } = data;
    const cartService = container.resolve(utils_1.Modules.CART);
    const [existingShippingMethodTaxLines, existingLineItemTaxLines] = await (0, utils_1.promiseAll)([
        shipping_tax_lines.length
            ? cartService.listShippingMethodTaxLines({
                shipping_method_id: shipping_tax_lines.map((t) => t.shipping_line_id),
            })
            : [],
        item_tax_lines.length
            ? cartService.listLineItemTaxLines({
                item_id: item_tax_lines.map((t) => t.line_item_id),
            })
            : [],
    ]);
    const itemsTaxLinesData = normalizeItemTaxLinesForCart(item_tax_lines, existingLineItemTaxLines);
    const shippingTaxLinesData = normalizeShippingTaxLinesForCart(shipping_tax_lines, existingShippingMethodTaxLines);
    await (0, utils_1.promiseAll)([
        itemsTaxLinesData.length
            ? cartService.upsertLineItemTaxLines(itemsTaxLinesData)
            : [],
        shippingTaxLinesData.length
            ? cartService.upsertShippingMethodTaxLines(shippingTaxLinesData)
            : [],
    ]);
    return new workflows_sdk_1.StepResponse(null, {
        cart,
        existingLineItemTaxLines,
        existingShippingMethodTaxLines,
    });
}, async (revertData, { container }) => {
    if (!revertData) {
        return;
    }
    const { existingLineItemTaxLines, existingShippingMethodTaxLines } = revertData;
    const cartService = container.resolve(utils_1.Modules.CART);
    if (existingLineItemTaxLines) {
        await cartService.upsertLineItemTaxLines(existingLineItemTaxLines.map((taxLine) => ({
            description: taxLine.description,
            tax_rate_id: taxLine.tax_rate_id,
            code: taxLine.code,
            rate: taxLine.rate,
            provider_id: taxLine.provider_id,
            item_id: taxLine.item_id,
        })));
    }
    await cartService.upsertShippingMethodTaxLines(existingShippingMethodTaxLines.map((taxLine) => ({
        description: taxLine.description,
        tax_rate_id: taxLine.tax_rate_id,
        code: taxLine.code,
        rate: taxLine.rate,
        provider_id: taxLine.provider_id,
        shipping_method_id: taxLine.shipping_method_id,
    })));
});
function normalizeItemTaxLinesForCart(taxLines, existingTaxLines) {
    return taxLines.map((taxLine) => ({
        id: existingTaxLines.find((t) => t.item_id === taxLine.line_item_id)?.id,
        description: taxLine.name,
        tax_rate_id: taxLine.rate_id,
        code: taxLine.code,
        rate: taxLine.rate,
        provider_id: taxLine.provider_id,
        item_id: taxLine.line_item_id,
    }));
}
function normalizeShippingTaxLinesForCart(taxLines, existingTaxLines) {
    return taxLines.map((taxLine) => ({
        id: existingTaxLines.find((t) => t.shipping_method_id === taxLine.shipping_line_id)?.id,
        description: taxLine.name,
        tax_rate_id: taxLine.rate_id,
        code: taxLine.code,
        rate: taxLine.rate,
        provider_id: taxLine.provider_id,
        shipping_method_id: taxLine.shipping_line_id,
    }));
}
//# sourceMappingURL=upsert-tax-lines-for-items.js.map