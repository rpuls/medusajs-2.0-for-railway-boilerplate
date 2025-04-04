import { WorkflowStepHandlerArguments } from "@medusajs/orchestration";
import { ApplyStepOptions } from "../create-step";
import { CreateWorkflowComposerContext, WorkflowData } from "../type";
import { StepResponse } from "./step-response";
export declare function createStepHandler<TInvokeInput, TStepInput extends {
    [K in keyof TInvokeInput]: WorkflowData<TInvokeInput[K]>;
}, TInvokeResultOutput, TInvokeResultCompensateInput>(this: CreateWorkflowComposerContext, { stepName, input, invokeFn, compensateFn, }: ApplyStepOptions<TStepInput, TInvokeInput, TInvokeResultOutput, TInvokeResultCompensateInput>): {
    invoke: (stepArguments: WorkflowStepHandlerArguments) => Promise<{
        __type: string;
        output: StepResponse<any, any> | {
            __type: string;
            output: any;
            compensateInput: any;
        };
    }>;
    compensate: ((stepArguments: WorkflowStepHandlerArguments) => Promise<{
        output: any;
    }>) | undefined;
};
//# sourceMappingURL=create-step-handler.d.ts.map