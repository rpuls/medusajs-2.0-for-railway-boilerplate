"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const { id } = req.params;
    const workflow = (0, core_flows_1.cancelReturnWorkflow)(req.scope);
    const { result } = await workflow.run({
        input: {
            ...req.validatedBody,
            return_id: id,
        },
    });
    res.status(200).json({ return: result });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map