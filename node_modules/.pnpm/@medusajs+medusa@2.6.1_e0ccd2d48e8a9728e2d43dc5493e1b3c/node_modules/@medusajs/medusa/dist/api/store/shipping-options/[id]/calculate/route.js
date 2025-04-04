"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { result } = await (0, core_flows_1.calculateShippingOptionsPricesWorkflow)(req.scope).run({
        input: {
            shipping_options: [{ id: req.params.id, data: req.validatedBody.data }],
            cart_id: req.validatedBody.cart_id,
        },
    });
    const { data } = await query.graph({
        entity: "shipping_option",
        fields: req.queryConfig.fields,
        filters: { id: req.params.id },
    });
    const shippingOption = data[0];
    const priceData = result[0];
    shippingOption.calculated_price = priceData;
    // ensure same shape as flat rate shipping options
    shippingOption.amount = priceData.calculated_amount;
    shippingOption.is_tax_inclusive = priceData.is_calculated_price_tax_inclusive;
    res.status(200).json({ shipping_option: shippingOption });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map