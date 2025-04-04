import { ILockingProvider } from "@medusajs/framework/types";
import { EntityManager } from "@mikro-orm/core";
type InjectedDependencies = {
    manager: EntityManager;
};
declare const PostgresAdvisoryLockProvider_base: import("@medusajs/framework/utils").MedusaServiceReturnType<import("@medusajs/framework/utils").ModelConfigurationsToConfigTemplate<{
    readonly Locking: import("@medusajs/framework/utils").DmlEntity<import("@medusajs/framework/utils").DMLEntitySchemaBuilder<{
        id: import("@medusajs/framework/utils").PrimaryKeyModifier<string, import("@medusajs/framework/utils").IdProperty>;
        owner_id: import("@medusajs/framework/utils").NullableModifier<string, import("@medusajs/framework/utils").TextProperty>;
        expiration: import("@medusajs/framework/utils").NullableModifier<Date, import("@medusajs/framework/utils").DateTimeProperty>;
    }>, "Locking">;
}>>;
export declare class PostgresAdvisoryLockProvider extends PostgresAdvisoryLockProvider_base implements ILockingProvider {
    static identifier: string;
    protected manager: EntityManager;
    constructor(container: InjectedDependencies);
    private getManager;
    execute<T>(keys: string | string[], job: () => Promise<T>, args?: {
        timeout?: number;
    }): Promise<T>;
    private loadLock;
    acquire(keys: string | string[], args?: {
        ownerId?: string | null;
        expire?: number;
    }): Promise<void>;
    release(keys: string | string[], args?: {
        ownerId?: string | null;
    }): Promise<boolean>;
    releaseAll(args?: {
        ownerId?: string | null;
    }): Promise<void>;
    private hashStringToInt;
    private getTimeout;
}
export {};
//# sourceMappingURL=advisory-lock.d.ts.map