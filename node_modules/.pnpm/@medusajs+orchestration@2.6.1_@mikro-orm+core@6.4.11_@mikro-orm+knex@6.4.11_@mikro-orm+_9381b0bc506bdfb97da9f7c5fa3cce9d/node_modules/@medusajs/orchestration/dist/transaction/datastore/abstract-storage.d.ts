import { DistributedTransactionType, TransactionCheckpoint } from "../distributed-transaction";
import { TransactionStep } from "../transaction-step";
import { SchedulerOptions, TransactionOptions } from "../types";
export interface IDistributedSchedulerStorage {
    schedule(jobDefinition: string | {
        jobId: string;
    }, schedulerOptions: SchedulerOptions): Promise<void>;
    remove(jobId: string): Promise<void>;
    removeAll(): Promise<void>;
}
export interface IDistributedTransactionStorage {
    get(key: string, options?: TransactionOptions): Promise<TransactionCheckpoint | undefined>;
    list(): Promise<TransactionCheckpoint[]>;
    save(key: string, data: TransactionCheckpoint, ttl?: number, options?: TransactionOptions): Promise<void>;
    scheduleRetry(transaction: DistributedTransactionType, step: TransactionStep, timestamp: number, interval: number): Promise<void>;
    clearRetry(transaction: DistributedTransactionType, step: TransactionStep): Promise<void>;
    scheduleTransactionTimeout(transaction: DistributedTransactionType, timestamp: number, interval: number): Promise<void>;
    scheduleStepTimeout(transaction: DistributedTransactionType, step: TransactionStep, timestamp: number, interval: number): Promise<void>;
    clearTransactionTimeout(transaction: DistributedTransactionType): Promise<void>;
    clearStepTimeout(transaction: DistributedTransactionType, step: TransactionStep): Promise<void>;
}
export declare abstract class DistributedSchedulerStorage implements IDistributedSchedulerStorage {
    constructor();
    schedule(jobDefinition: string | {
        jobId: string;
    }, schedulerOptions: SchedulerOptions): Promise<void>;
    remove(jobId: string): Promise<void>;
    removeAll(): Promise<void>;
}
export declare abstract class DistributedTransactionStorage implements IDistributedTransactionStorage {
    constructor();
    get(key: string): Promise<TransactionCheckpoint | undefined>;
    list(): Promise<TransactionCheckpoint[]>;
    save(key: string, data: TransactionCheckpoint, ttl?: number): Promise<void>;
    scheduleRetry(transaction: DistributedTransactionType, step: TransactionStep, timestamp: number, interval: number): Promise<void>;
    clearRetry(transaction: DistributedTransactionType, step: TransactionStep): Promise<void>;
    scheduleTransactionTimeout(transaction: DistributedTransactionType, timestamp: number, interval: number): Promise<void>;
    clearTransactionTimeout(transaction: DistributedTransactionType): Promise<void>;
    scheduleStepTimeout(transaction: DistributedTransactionType, step: TransactionStep, timestamp: number, interval: number): Promise<void>;
    clearStepTimeout(transaction: DistributedTransactionType, step: TransactionStep): Promise<void>;
}
//# sourceMappingURL=abstract-storage.d.ts.map