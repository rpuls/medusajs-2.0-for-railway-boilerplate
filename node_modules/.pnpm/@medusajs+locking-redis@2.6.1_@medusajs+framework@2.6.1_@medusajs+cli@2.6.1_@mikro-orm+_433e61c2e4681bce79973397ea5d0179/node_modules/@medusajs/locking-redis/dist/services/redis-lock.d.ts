import { ILockingProvider } from "@medusajs/types";
import { RedisCacheModuleOptions } from "../types";
import { Redis } from "ioredis";
export declare class RedisLockingProvider implements ILockingProvider {
    static identifier: string;
    protected redisClient: Redis & {
        acquireLock: (key: string, ownerId: string, ttl: number, awaitQueue?: boolean) => Promise<number>;
        releaseLock: (key: string, ownerId: string) => Promise<number>;
    };
    protected keyNamePrefix: string;
    protected waitLockingTimeout: number;
    protected defaultRetryInterval: number;
    protected maximumRetryInterval: number;
    constructor({ redisClient, prefix }: {
        redisClient: any;
        prefix: any;
    }, options: RedisCacheModuleOptions);
    private getKeyName;
    execute<T>(keys: string | string[], job: () => Promise<T>, args?: {
        timeout?: number;
    }): Promise<T>;
    acquire(keys: string | string[], args?: {
        ownerId?: string;
        expire?: number;
        awaitQueue?: boolean;
    }): Promise<void>;
    acquire_(keys: string | string[], args?: {
        ownerId?: string;
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
//# sourceMappingURL=redis-lock.d.ts.map