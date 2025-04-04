"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const DELETE = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.cancelBeginOrderEditWorkflow)(req.scope).run({
        input: {
            order_id: id,
        },
    });
    res.status(200).json({
        id,
        object: "order-edit",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map