"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaxLinesWorkflow = exports.updateTaxLinesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const get_item_tax_lines_1 = require("../../tax/steps/get-item-tax-lines");
const steps_1 = require("../steps");
const cartFields = [
    "id",
    "currency_code",
    "email",
    "region.id",
    "region.automatic_taxes",
    "items.id",
    "items.variant_id",
    "items.product_id",
    "items.product_title",
    "items.product_description",
    "items.product_subtitle",
    "items.product_type",
    "items.product_type_id",
    "items.product_collection",
    "items.product_handle",
    "items.variant_sku",
    "items.variant_barcode",
    "items.variant_title",
    "items.title",
    "items.quantity",
    "items.unit_price",
    "items.tax_lines.id",
    "items.tax_lines.description",
    "items.tax_lines.code",
    "items.tax_lines.rate",
    "items.tax_lines.provider_id",
    "shipping_methods.tax_lines.id",
    "shipping_methods.tax_lines.description",
    "shipping_methods.tax_lines.code",
    "shipping_methods.tax_lines.rate",
    "shipping_methods.tax_lines.provider_id",
    "shipping_methods.shipping_option_id",
    "shipping_methods.amount",
    "customer.id",
    "customer.email",
    "customer.metadata",
    "customer.groups.id",
    "shipping_address.id",
    "shipping_address.address_1",
    "shipping_address.address_2",
    "shipping_address.city",
    "shipping_address.postal_code",
    "shipping_address.country_code",
    "shipping_address.region_code",
    "shipping_address.province",
    "shipping_address.metadata",
];
exports.updateTaxLinesWorkflowId = "update-tax-lines";
/**
 * This workflow updates a cart's tax lines that are applied on line items and shipping methods. You can update the line item's quantity, unit price, and more. This workflow is executed
 * by the [Calculate Taxes Store API Route](https://docs.medusajs.com/api/store#carts_postcartsidtaxes).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to update a cart's tax lines in your custom flows.
 *
 * @example
 * const { result } = await updateTaxLinesWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *   }
 * })
 *
 * @summary
 *
 * Update a cart's tax lines.
 */
exports.updateTaxLinesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateTaxLinesWorkflowId, (input) => {
    const fetchCart = (0, workflows_sdk_1.when)({ input }, ({ input }) => {
        return !input.cart;
    }).then(() => {
        return (0, common_1.useRemoteQueryStep)({
            entry_point: "cart",
            fields: cartFields,
            variables: { id: input.cart_id },
            throw_if_key_not_found: true,
            list: false,
        });
    });
    const cart = (0, workflows_sdk_1.transform)({ fetchCart, input }, ({ fetchCart, input }) => {
        return input.cart ?? fetchCart;
    });
    const taxLineItems = (0, get_item_tax_lines_1.getItemTaxLinesStep)((0, workflows_sdk_1.transform)({ input, cart }, (data) => ({
        orderOrCart: data.cart,
        items: data.cart.items,
        shipping_methods: data.cart.shipping_methods,
        force_tax_calculation: data.input.force_tax_calculation,
    })));
    (0, steps_1.setTaxLinesForItemsStep)({
        cart,
        item_tax_lines: taxLineItems.lineItemTaxLines,
        shipping_tax_lines: taxLineItems.shippingMethodsTaxLines,
    });
});
//# sourceMappingURL=update-tax-lines.js.map