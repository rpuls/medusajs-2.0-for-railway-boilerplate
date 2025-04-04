import { Context, MedusaContainer } from "@medusajs/types";
import { DistributedTransactionType, TransactionMetadata, TransactionModelOptions, TransactionOrchestrator, TransactionStep, TransactionStepHandler, TransactionStepsDefinition } from "../transaction";
export interface WorkflowDefinition {
    id: string;
    handler: (container: MedusaContainer, context?: Context) => TransactionStepHandler;
    orchestrator: TransactionOrchestrator;
    flow_: TransactionStepsDefinition;
    handlers_: Map<string, {
        invoke: WorkflowStepHandler;
        compensate?: WorkflowStepHandler;
    }>;
    options: TransactionModelOptions;
    requiredModules?: Set<string>;
    optionalModules?: Set<string>;
}
export type WorkflowHandler = Map<string, {
    invoke: WorkflowStepHandler;
    compensate?: WorkflowStepHandler;
}>;
export type WorkflowStepHandlerArguments = {
    container: MedusaContainer;
    payload: unknown;
    invoke: {
        [actions: string]: unknown;
    };
    compensate: {
        [actions: string]: unknown;
    };
    metadata: TransactionMetadata;
    transaction: DistributedTransactionType;
    step: TransactionStep;
    orchestrator: TransactionOrchestrator;
    context?: Context;
};
export type WorkflowStepHandler = (args: WorkflowStepHandlerArguments) => Promise<unknown>;
declare const GlobalWorkflowManager: any;
export { GlobalWorkflowManager as WorkflowManager };
//# sourceMappingURL=workflow-manager.d.ts.map