"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const input = req.file;
    if (!input) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "No file was uploaded for importing");
    }
    const { result, transaction } = await (0, core_flows_1.importProductsWorkflow)(req.scope).run({
        input: {
            filename: input.originalname,
            fileContent: input.buffer.toString("utf-8"),
        },
    });
    res
        .status(202)
        .json({ transaction_id: transaction.transactionId, summary: result });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map