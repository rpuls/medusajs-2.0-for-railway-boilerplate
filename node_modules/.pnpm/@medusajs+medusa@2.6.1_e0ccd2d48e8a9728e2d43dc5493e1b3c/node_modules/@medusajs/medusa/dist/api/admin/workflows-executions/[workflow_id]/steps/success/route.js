"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const POST = async (req, res) => {
    const workflowEngineService = req.scope.resolve(utils_1.Modules.WORKFLOW_ENGINE);
    const { workflow_id } = req.params;
    const body = req.validatedBody;
    const { transaction_id, step_id } = body;
    const compensateInput = body.compensate_input;
    const stepResponse = (0, utils_1.isDefined)(body.response)
        ? new workflows_sdk_1.StepResponse(body.response, compensateInput)
        : undefined;
    const stepAction = body.action || utils_1.TransactionHandlerType.INVOKE;
    await workflowEngineService.setStepSuccess({
        idempotencyKey: {
            action: stepAction,
            transactionId: transaction_id,
            stepId: step_id,
            workflowId: workflow_id,
        },
        stepResponse,
        options: {
            container: req.scope,
            context: {
                requestId: req.requestId,
            },
        },
    });
    return res.status(200).json({ success: true });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map