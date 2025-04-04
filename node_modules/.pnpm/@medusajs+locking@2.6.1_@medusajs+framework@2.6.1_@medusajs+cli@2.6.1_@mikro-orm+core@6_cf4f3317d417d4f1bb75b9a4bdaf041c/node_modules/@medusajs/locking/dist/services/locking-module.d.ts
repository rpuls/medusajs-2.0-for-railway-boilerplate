import { Context, ILockingModule, InternalModuleDeclaration, Logger } from "@medusajs/types";
import { EntityManager } from "@mikro-orm/core";
import { LockingDefaultProvider } from "../types";
import LockingProviderService from "./locking-provider";
type InjectedDependencies = {
    manager: EntityManager;
    lockingProviderService: LockingProviderService;
    logger?: Logger;
    [LockingDefaultProvider]: string;
};
export default class LockingModuleService implements ILockingModule {
    protected readonly moduleDeclaration: InternalModuleDeclaration;
    protected manager: EntityManager;
    protected providerService_: LockingProviderService;
    protected defaultProviderId: string;
    constructor(container: InjectedDependencies, moduleDeclaration: InternalModuleDeclaration);
    execute<T>(keys: string | string[], job: () => Promise<T>, args?: {
        timeout?: number;
        provider?: string;
    }, sharedContext?: Context): Promise<T>;
    acquire(keys: string | string[], args?: {
        ownerId?: string | null;
        expire?: number;
        provider?: string;
    }, sharedContext?: Context): Promise<void>;
    release(keys: string | string[], args?: {
        ownerId?: string | null;
        provider?: string;
    }, sharedContext?: Context): Promise<boolean>;
    releaseAll(args?: {
        ownerId?: string | null;
        provider?: string;
    }, sharedContext?: Context): Promise<void>;
}
export {};
//# sourceMappingURL=locking-module.d.ts.map