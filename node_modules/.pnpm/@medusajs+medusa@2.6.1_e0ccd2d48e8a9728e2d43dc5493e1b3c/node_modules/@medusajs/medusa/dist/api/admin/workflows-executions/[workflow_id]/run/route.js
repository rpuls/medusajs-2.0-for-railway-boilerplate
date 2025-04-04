"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const workflowEngineService = req.scope.resolve(utils_1.Modules.WORKFLOW_ENGINE);
    const { workflow_id } = req.params;
    const { transaction_id, input } = req.validatedBody;
    const options = {
        transactionId: transaction_id,
        input,
        context: {
            requestId: req.requestId,
        },
    };
    const { acknowledgement } = await workflowEngineService.run(workflow_id, options);
    return res.status(200).json({ acknowledgement });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map