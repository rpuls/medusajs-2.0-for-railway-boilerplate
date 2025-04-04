"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../helpers");
const POST = async (req, res) => {
    await (0, core_flows_1.createLocationFulfillmentSetWorkflow)(req.scope).run({
        input: {
            location_id: req.params.id,
            fulfillment_set_data: {
                name: req.validatedBody.name,
                type: req.validatedBody.type,
            },
        },
    });
    const stockLocation = await (0, helpers_1.refetchStockLocation)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ stock_location: stockLocation });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map