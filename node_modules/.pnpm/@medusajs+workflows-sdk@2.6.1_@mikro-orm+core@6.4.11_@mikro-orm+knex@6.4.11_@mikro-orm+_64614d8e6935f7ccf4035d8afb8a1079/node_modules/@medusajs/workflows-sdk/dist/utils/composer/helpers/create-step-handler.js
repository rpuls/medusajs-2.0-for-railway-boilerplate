"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStepHandler = createStepHandler;
const utils_1 = require("@medusajs/utils");
const resolve_value_1 = require("./resolve-value");
function buildStepContext({ action, stepArguments, }) {
    const metadata = stepArguments.metadata;
    const idempotencyKey = metadata.idempotency_key;
    stepArguments.context.idempotencyKey = idempotencyKey;
    const flowMetadata = stepArguments.transaction.getFlow()?.metadata;
    const executionContext = {
        workflowId: metadata.model_id,
        stepName: metadata.action,
        action,
        idempotencyKey,
        attempt: metadata.attempt,
        container: stepArguments.container,
        metadata,
        eventGroupId: flowMetadata?.eventGroupId ?? stepArguments.context.eventGroupId,
        parentStepIdempotencyKey: flowMetadata?.parentStepIdempotencyKey,
        transactionId: stepArguments.context.transactionId,
        context: stepArguments.context,
    };
    return executionContext;
}
function createStepHandler({ stepName, input, invokeFn, compensateFn, }) {
    const handler = {
        invoke: async (stepArguments) => {
            const executionContext = buildStepContext({
                action: "invoke",
                stepArguments,
            });
            const argInput = input ? await (0, resolve_value_1.resolveValue)(input, stepArguments) : {};
            const stepResponse = await invokeFn.apply(this, [
                argInput,
                executionContext,
            ]);
            const stepResponseJSON = stepResponse?.__type === utils_1.OrchestrationUtils.SymbolWorkflowStepResponse
                ? stepResponse.toJSON()
                : stepResponse;
            return {
                __type: utils_1.OrchestrationUtils.SymbolWorkflowWorkflowData,
                output: stepResponseJSON,
            };
        },
        compensate: compensateFn
            ? async (stepArguments) => {
                const executionContext = buildStepContext({
                    action: "compensate",
                    stepArguments,
                });
                const stepOutput = stepArguments.invoke[stepName]?.output;
                const invokeResult = stepOutput?.__type === utils_1.OrchestrationUtils.SymbolWorkflowStepResponse
                    ? stepOutput.compensateInput
                    : stepOutput;
                const args = [invokeResult, executionContext];
                const output = await compensateFn.apply(this, args);
                return {
                    output,
                };
            }
            : undefined,
    };
    return handler;
}
//# sourceMappingURL=create-step-handler.js.map