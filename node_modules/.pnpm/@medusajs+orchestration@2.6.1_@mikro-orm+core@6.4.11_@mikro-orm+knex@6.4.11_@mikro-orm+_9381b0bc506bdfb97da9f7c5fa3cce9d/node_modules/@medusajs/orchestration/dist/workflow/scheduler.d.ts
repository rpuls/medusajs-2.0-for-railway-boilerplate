import { IDistributedSchedulerStorage } from "../transaction";
import { WorkflowDefinition } from "./workflow-manager";
declare class WorkflowScheduler {
    private static storage;
    static setStorage(storage: IDistributedSchedulerStorage): void;
    scheduleWorkflow(workflow: WorkflowDefinition): Promise<void>;
    clearWorkflow(workflow: WorkflowDefinition): Promise<void>;
    clear(): Promise<void>;
}
declare const GlobalWorkflowScheduler: typeof WorkflowScheduler;
export { GlobalWorkflowScheduler as WorkflowScheduler };
//# sourceMappingURL=scheduler.d.ts.map