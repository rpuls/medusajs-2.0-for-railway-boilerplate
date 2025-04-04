"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../../../../../helpers");
const POST = async (req, res) => {
    const variantId = req.params.variant_id;
    const inventoryItemId = req.params.inventory_item_id;
    await (0, core_flows_1.updateLinksWorkflow)(req.scope).run({
        input: [
            {
                [utils_1.Modules.PRODUCT]: { variant_id: variantId },
                [utils_1.Modules.INVENTORY]: { inventory_item_id: inventoryItemId },
                data: { required_quantity: req.validatedBody.required_quantity },
            },
        ],
    });
    const variant = await (0, helpers_1.refetchVariant)(variantId, req.scope, req.queryConfig.fields);
    res.status(200).json({ variant });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const variantId = req.params.variant_id;
    const inventoryItemId = req.params.inventory_item_id;
    const { result: [deleted], } = await (0, core_flows_1.dismissLinksWorkflow)(req.scope).run({
        input: [
            {
                [utils_1.Modules.PRODUCT]: { variant_id: variantId },
                [utils_1.Modules.INVENTORY]: { inventory_item_id: inventoryItemId },
            },
        ],
    });
    const parent = await (0, helpers_1.refetchVariant)(variantId, req.scope, req.queryConfig.fields);
    res.status(200).json({
        id: deleted,
        object: "variant-inventory-item-link",
        deleted: true,
        parent,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map