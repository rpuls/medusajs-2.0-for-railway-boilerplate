"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../helpers");
const POST = async (req, res) => {
    const workflowInput = {
        data: [
            {
                fulfillment_set_id: req.params.id,
                name: req.validatedBody.name,
                geo_zones: req.validatedBody.geo_zones,
            },
        ],
    };
    await (0, core_flows_1.createServiceZonesWorkflow)(req.scope).run({
        input: workflowInput,
    });
    const fulfillmentSet = await (0, helpers_1.refetchFulfillmentSet)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ fulfillment_set: fulfillmentSet });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map