"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOrderTaxLinesForItemsStep = exports.setOrderTaxLinesForItemsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.setOrderTaxLinesForItemsStepId = "set-order-tax-lines-for-items";
/**
 * This step sets the tax lines of an order's items and shipping methods.
 *
 * :::note
 *
 * You can retrieve an order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = setOrderTaxLinesForItemsStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   item_tax_lines: [
 *     {
 *       line_item_id: "orli_123",
 *       rate: 0.25,
 *       code: "VAT",
 *       name: "VAT",
 *       provider_id: "tax_provider_123",
 *     }
 *   ]
 * })
 */
exports.setOrderTaxLinesForItemsStep = (0, workflows_sdk_1.createStep)(exports.setOrderTaxLinesForItemsStepId, async (data, { container }) => {
    const { order, item_tax_lines, shipping_tax_lines } = data;
    const orderService = container.resolve(utils_1.Modules.ORDER);
    const getShippingTaxLinesPromise = await orderService.listOrderShippingMethodTaxLines({
        shipping_method_id: shipping_tax_lines.map((t) => t.shipping_line_id),
    });
    const getItemTaxLinesPromise = await orderService.listOrderLineItemTaxLines({
        item_id: item_tax_lines.map((t) => t.line_item_id),
    });
    const itemsTaxLinesData = normalizeItemTaxLinesForOrder(item_tax_lines);
    const setItemTaxLinesPromise = itemsTaxLinesData.length
        ? orderService.upsertOrderLineItemTaxLines(itemsTaxLinesData)
        : void 0;
    const shippingTaxLinesData = normalizeShippingTaxLinesForOrder(shipping_tax_lines);
    const setShippingTaxLinesPromise = shippingTaxLinesData.length
        ? await orderService.upsertOrderShippingMethodTaxLines(shippingTaxLinesData)
        : void 0;
    const [existingShippingMethodTaxLines, existingLineItemTaxLines] = await (0, utils_1.promiseAll)([
        getShippingTaxLinesPromise,
        getItemTaxLinesPromise,
        setItemTaxLinesPromise,
        setShippingTaxLinesPromise,
    ]);
    return new workflows_sdk_1.StepResponse(void 0, {
        order,
        existingLineItemTaxLines,
        existingShippingMethodTaxLines,
    });
}, async (revertData, { container }) => {
    if (!revertData) {
        return;
    }
    const { existingLineItemTaxLines, existingShippingMethodTaxLines } = revertData;
    const orderService = container.resolve(utils_1.Modules.ORDER);
    if (existingLineItemTaxLines) {
        await orderService.upsertOrderLineItemTaxLines(existingLineItemTaxLines.map((taxLine) => ({
            description: taxLine.description,
            tax_rate_id: taxLine.tax_rate_id,
            code: taxLine.code,
            rate: taxLine.rate,
            provider_id: taxLine.provider_id,
            item_id: taxLine.item_id,
        })));
    }
    await orderService.upsertOrderShippingMethodTaxLines(existingShippingMethodTaxLines.map((taxLine) => ({
        description: taxLine.description,
        tax_rate_id: taxLine.tax_rate_id,
        code: taxLine.code,
        rate: taxLine.rate,
        provider_id: taxLine.provider_id,
        shipping_method_id: taxLine.shipping_method_id,
    })));
});
function normalizeItemTaxLinesForOrder(taxLines) {
    return taxLines.map((taxLine) => ({
        description: taxLine.name,
        tax_rate_id: taxLine.rate_id,
        code: taxLine.code,
        rate: taxLine.rate,
        provider_id: taxLine.provider_id,
        item_id: taxLine.line_item_id,
    }));
}
function normalizeShippingTaxLinesForOrder(taxLines) {
    return taxLines.map((taxLine) => ({
        description: taxLine.name,
        tax_rate_id: taxLine.rate_id,
        code: taxLine.code,
        rate: taxLine.rate,
        provider_id: taxLine.provider_id,
        shipping_method_id: taxLine.shipping_line_id,
    }));
}
//# sourceMappingURL=set-tax-lines-for-items.js.map