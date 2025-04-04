import { OrchestrationUtils } from "@medusajs/utils";
import { WorkflowData, WorkflowDataProperties } from "../type";
/**
 * Workflow response class encapsulates the return value of a workflow
 */
export declare class WorkflowResponse<TResult, THooks = []> {
    $result: WorkflowData<TResult> | {
        [K in keyof TResult]: WorkflowData<TResult[K]> | WorkflowDataProperties<TResult[K]> | TResult[K];
    };
    options?: {
        hooks: THooks;
    } | undefined;
    __type: typeof OrchestrationUtils.SymbolMedusaWorkflowResponse;
    constructor($result: WorkflowData<TResult> | {
        [K in keyof TResult]: WorkflowData<TResult[K]> | WorkflowDataProperties<TResult[K]> | TResult[K];
    }, options?: {
        hooks: THooks;
    } | undefined);
}
//# sourceMappingURL=workflow-response.d.ts.map