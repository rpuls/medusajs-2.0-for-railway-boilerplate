import { DistributedTransactionType } from "./distributed-transaction";
import { TransactionStepHandler } from "./transaction-step";
import { TransactionFlow, TransactionModelOptions, TransactionOptions, TransactionStepsDefinition } from "./types";
import { EventEmitter } from "events";
/**
 * @class TransactionOrchestrator is responsible for managing and executing distributed transactions.
 * It is based on a single transaction definition, which is used to execute all the transaction steps
 */
export declare class TransactionOrchestrator extends EventEmitter {
    id: string;
    private static ROOT_STEP;
    static DEFAULT_TTL: number;
    private invokeSteps;
    private compensateSteps;
    private definition;
    private options?;
    static DEFAULT_RETRIES: number;
    private static workflowOptions;
    static getWorkflowOptions(modelId: string): TransactionOptions;
    /**
     * Trace workflow transaction for instrumentation
     */
    static traceTransaction?: (transactionResume: (...args: any[]) => Promise<void>, metadata: {
        model_id: string;
        transaction_id: string;
        flow_metadata: TransactionFlow["metadata"];
    }) => Promise<any>;
    /**
     * Trace workflow steps for instrumentation
     */
    static traceStep?: (handler: (...args: any[]) => Promise<any>, metadata: {
        action: string;
        type: "invoke" | "compensate";
        step_id: string;
        step_uuid: string;
        attempts: number;
        failures: number;
        async: boolean;
        idempotency_key: string;
    }) => Promise<any>;
    constructor({ id, definition, options, isClone, }: {
        id: string;
        definition: TransactionStepsDefinition;
        options?: TransactionModelOptions;
        isClone?: boolean;
    });
    static clone(orchestrator: TransactionOrchestrator): TransactionOrchestrator;
    private static SEPARATOR;
    static getKeyName(...params: string[]): string;
    private getPreviousStep;
    getOptions(): TransactionModelOptions;
    private getInvokeSteps;
    private getCompensationSteps;
    private canMoveForward;
    private canMoveBackward;
    private canContinue;
    private hasExpired;
    private checkTransactionTimeout;
    private checkStepTimeout;
    private checkAllSteps;
    private flagStepsToRevert;
    private static setStepSuccess;
    private static skipStep;
    private static setStepTimeout;
    private static setStepFailure;
    private executeNext;
    /**
     * Start a new transaction or resume a transaction that has been previously started
     * @param transaction - The transaction to resume
     */
    resume(transaction: DistributedTransactionType): Promise<void>;
    /**
     * Cancel and revert a transaction compensating all its executed steps. It can be an ongoing transaction or a completed one
     * @param transaction - The transaction to be reverted
     */
    cancelTransaction(transaction: DistributedTransactionType): Promise<void>;
    private parseFlowOptions;
    private createTransactionFlow;
    private static loadTransactionById;
    private static buildSteps;
    /** Create a new transaction
     * @param transactionId - unique identifier of the transaction
     * @param handler - function to handle action of the transaction
     * @param payload - payload to be passed to all the transaction steps
     * @param flowMetadata - flow metadata which can include event group id for example
     */
    beginTransaction(transactionId: string, handler: TransactionStepHandler, payload?: unknown, flowMetadata?: TransactionFlow["metadata"]): Promise<DistributedTransactionType>;
    /** Returns an existing transaction
     * @param transactionId - unique identifier of the transaction
     * @param handler - function to handle action of the transaction
     */
    retrieveExistingTransaction(transactionId: string, handler: TransactionStepHandler): Promise<DistributedTransactionType>;
    private static getStepByAction;
    private static getTransactionAndStepFromIdempotencyKey;
    /** Skip the execution of a specific transaction and step
     * @param responseIdempotencyKey - The idempotency key for the step
     * @param handler - The handler function to execute the step
     * @param transaction - The current transaction. If not provided it will be loaded based on the responseIdempotencyKey
     */
    skipStep(responseIdempotencyKey: string, handler?: TransactionStepHandler, transaction?: DistributedTransactionType): Promise<DistributedTransactionType>;
    /** Register a step success for a specific transaction and step
     * @param responseIdempotencyKey - The idempotency key for the step
     * @param handler - The handler function to execute the step
     * @param transaction - The current transaction. If not provided it will be loaded based on the responseIdempotencyKey
     * @param response - The response of the step
     */
    registerStepSuccess(responseIdempotencyKey: string, handler?: TransactionStepHandler, transaction?: DistributedTransactionType, response?: unknown): Promise<DistributedTransactionType>;
    /**
     * Register a step failure for a specific transaction and step
     * @param responseIdempotencyKey - The idempotency key for the step
     * @param error - The error that caused the failure
     * @param handler - The handler function to execute the step
     * @param transaction - The current transaction
     * @param response - The response of the step
     */
    registerStepFailure(responseIdempotencyKey: string, error?: Error | any, handler?: TransactionStepHandler, transaction?: DistributedTransactionType): Promise<DistributedTransactionType>;
}
//# sourceMappingURL=transaction-orchestrator.d.ts.map