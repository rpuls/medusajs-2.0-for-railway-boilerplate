import { ILockingProvider } from "@medusajs/framework/types";
export declare class InMemoryLockingProvider implements ILockingProvider {
    static identifier: string;
    private locks;
    constructor();
    private getPromise;
    execute<T>(keys: string | string[], job: () => Promise<T>, args?: {
        timeout?: number;
    }): Promise<T>;
    acquire(keys: string | string[], args?: {
        ownerId?: string | null;
        expire?: number;
        awaitQueue?: boolean;
    }): Promise<void>;
    acquire_(keys: string | string[], args?: {
        ownerId?: string | null;
        expire?: number;
        awaitQueue?: boolean;
    }, cancellationToken?: {
        cancelled: boolean;
    }): Promise<void>;
    release(keys: string | string[], args?: {
        ownerId?: string | null;
    }): Promise<boolean>;
    releaseAll(args?: {
        ownerId?: string | null;
    }): Promise<void>;
    private getTimeout;
}
//# sourceMappingURL=in-memory.d.ts.map