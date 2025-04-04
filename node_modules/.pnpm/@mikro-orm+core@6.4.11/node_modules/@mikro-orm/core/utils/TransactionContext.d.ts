import type { EntityManager } from '../EntityManager';
export declare class TransactionContext {
    readonly em: EntityManager;
    private static storage;
    readonly id: number;
    constructor(em: EntityManager);
    /**
     * Creates new TransactionContext instance and runs the code inside its domain.
     */
    static create<T>(em: EntityManager, next: (...args: any[]) => T): T;
    /**
     * Returns current TransactionContext (if available).
     */
    static currentTransactionContext(): TransactionContext | undefined;
    /**
     * Returns current EntityManager (if available).
     */
    static getEntityManager(name?: string): EntityManager | undefined;
}
