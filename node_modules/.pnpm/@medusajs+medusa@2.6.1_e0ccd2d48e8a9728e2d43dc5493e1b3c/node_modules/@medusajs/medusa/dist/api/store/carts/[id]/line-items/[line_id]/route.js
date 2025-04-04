"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const framework_1 = require("@medusajs/framework");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../../../helpers");
const POST = async (req, res) => {
    // TODO: Move this to the workflow when the query to line item is fixed
    const cart = await (0, helpers_1.refetchCart)(req.params.id, req.scope, (0, framework_1.prepareListQuery)({}, {
        defaults: [
            "id",
            "region_id",
            "customer_id",
            "sales_channel_id",
            "currency_code",
            "*items",
        ],
    }).remoteQueryConfig.fields);
    const item = cart.items?.find((i) => i.id === req.params.line_id);
    if (!item) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Line item with id: ${req.params.line_id} was not found`);
    }
    await (0, core_flows_1.updateLineItemInCartWorkflow)(req.scope).run({
        input: {
            cart_id: req.params.id,
            item_id: item.id,
            update: req.validatedBody,
        },
    });
    const updatedCart = await (0, helpers_1.refetchCart)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ cart: updatedCart });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.line_id;
    await (0, core_flows_1.deleteLineItemsWorkflow)(req.scope).run({
        input: { cart_id: req.params.id, ids: [id] },
    });
    const cart = await (0, helpers_1.refetchCart)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({
        id: id,
        object: "line-item",
        deleted: true,
        parent: cart,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map