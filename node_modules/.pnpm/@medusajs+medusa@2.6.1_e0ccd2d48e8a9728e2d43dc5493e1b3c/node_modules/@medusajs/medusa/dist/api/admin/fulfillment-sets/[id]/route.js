"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const DELETE = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.deleteFulfillmentSetsWorkflow)(req.scope).run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "fulfillment_set",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map