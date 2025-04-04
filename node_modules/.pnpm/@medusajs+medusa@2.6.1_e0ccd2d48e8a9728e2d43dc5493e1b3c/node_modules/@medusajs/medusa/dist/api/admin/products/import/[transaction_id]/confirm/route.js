"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const POST = async (req, res) => {
    const workflowEngineService = req.scope.resolve(utils_1.Modules.WORKFLOW_ENGINE);
    const transactionId = req.params.transaction_id;
    await workflowEngineService.setStepSuccess({
        idempotencyKey: {
            action: utils_1.TransactionHandlerType.INVOKE,
            transactionId,
            stepId: core_flows_1.waitConfirmationProductImportStepId,
            workflowId: core_flows_1.importProductsWorkflowId,
        },
        stepResponse: new workflows_sdk_1.StepResponse(true),
    });
    res.status(202).json({});
};
exports.POST = POST;
//# sourceMappingURL=route.js.map