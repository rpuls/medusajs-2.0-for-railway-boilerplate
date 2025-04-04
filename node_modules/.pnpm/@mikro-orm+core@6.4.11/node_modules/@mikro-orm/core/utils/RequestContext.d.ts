import type { EntityManager } from '../EntityManager';
import { type LoggingOptions } from '../logging/Logger';
/**
 * Uses `AsyncLocalStorage` to create async context that holds the current EM fork.
 */
export declare class RequestContext {
    readonly map: Map<string, EntityManager>;
    private static storage;
    private static counter;
    readonly id: number;
    constructor(map: Map<string, EntityManager>);
    /**
     * Returns default EntityManager.
     */
    get em(): EntityManager | undefined;
    /**
     * Creates new RequestContext instance and runs the code inside its domain.
     * If the handler is async, the return value needs to be awaited.
     * Uses `AsyncLocalStorage.run()`, suitable for regular express style middlewares with a `next` callback.
     */
    static create<T>(em: EntityManager | EntityManager[], next: (...args: any[]) => T, options?: CreateContextOptions): T;
    /**
     * Creates new RequestContext instance and runs the code inside its domain.
     * If the handler is async, the return value needs to be awaited.
     * Uses `AsyncLocalStorage.enterWith()`, suitable for elysia style middlewares without a `next` callback.
     */
    static enter(em: EntityManager | EntityManager[], options?: CreateContextOptions): void;
    /**
     * Returns current RequestContext (if available).
     */
    static currentRequestContext(): RequestContext | undefined;
    /**
     * Returns current EntityManager (if available).
     */
    static getEntityManager(name?: string): EntityManager | undefined;
    private static createContext;
}
export interface CreateContextOptions {
    schema?: string;
    loggerContext?: LoggingOptions;
}
