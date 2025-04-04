import { DistributedTransactionType, IDistributedSchedulerStorage, IDistributedTransactionStorage, SchedulerOptions, TransactionCheckpoint, TransactionOptions, TransactionStep } from "@medusajs/framework/orchestration";
import { Logger, ModulesSdkTypes } from "@medusajs/framework/types";
export declare class InMemoryDistributedTransactionStorage implements IDistributedTransactionStorage, IDistributedSchedulerStorage {
    private workflowExecutionService_;
    private logger_;
    private workflowOrchestratorService_;
    private storage;
    private scheduled;
    private retries;
    private timeouts;
    constructor({ workflowExecutionService, logger, }: {
        workflowExecutionService: ModulesSdkTypes.IMedusaInternalService<any>;
        logger: Logger;
    });
    setWorkflowOrchestratorService(workflowOrchestratorService: any): void;
    private saveToDb;
    private deleteFromDb;
    get(key: string, options?: TransactionOptions): Promise<TransactionCheckpoint | undefined>;
    list(): Promise<TransactionCheckpoint[]>;
    save(key: string, data: TransactionCheckpoint, ttl?: number, options?: TransactionOptions): Promise<void>;
    scheduleRetry(transaction: DistributedTransactionType, step: TransactionStep, timestamp: number, interval: number): Promise<void>;
    clearRetry(transaction: DistributedTransactionType, step: TransactionStep): Promise<void>;
    scheduleTransactionTimeout(transaction: DistributedTransactionType, timestamp: number, interval: number): Promise<void>;
    clearTransactionTimeout(transaction: DistributedTransactionType): Promise<void>;
    scheduleStepTimeout(transaction: DistributedTransactionType, step: TransactionStep, timestamp: number, interval: number): Promise<void>;
    clearStepTimeout(transaction: DistributedTransactionType, step: TransactionStep): Promise<void>;
    schedule(jobDefinition: string | {
        jobId: string;
    }, schedulerOptions: SchedulerOptions): Promise<void>;
    remove(jobId: string): Promise<void>;
    removeAll(): Promise<void>;
    jobHandler(jobId: string): Promise<void>;
}
//# sourceMappingURL=workflow-orchestrator-storage.d.ts.map