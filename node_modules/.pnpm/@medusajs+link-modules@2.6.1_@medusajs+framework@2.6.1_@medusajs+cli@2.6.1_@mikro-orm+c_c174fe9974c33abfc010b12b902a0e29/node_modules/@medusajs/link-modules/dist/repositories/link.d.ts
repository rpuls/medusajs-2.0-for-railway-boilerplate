import { Context, ModuleJoinerConfig } from "@medusajs/framework/types";
import { EntitySchema } from "@mikro-orm/core";
export declare function getLinkRepository(model: EntitySchema): {
    new ({ joinerConfig }: {
        joinerConfig: ModuleJoinerConfig;
    }): {
        readonly joinerConfig_: ModuleJoinerConfig;
        delete(data: any, context?: Context): Promise<string[]>;
        create(data: object[], context?: Context): Promise<object[]>;
        entity: import("@mikro-orm/core").EntityClass<EntitySchema<any, never>>;
        update(data: {
            entity: any;
            update: any;
        }[], context?: Context): Promise<any[]>;
        find(options?: import("@medusajs/framework/types").FindOptions<EntitySchema<any, never>> | undefined, context?: Context): Promise<any[]>;
        findAndCount(options?: import("@medusajs/framework/types").FindOptions<EntitySchema<any, never>> | undefined, context?: Context): Promise<[any[], number]>;
        upsert(data: unknown[], context?: Context): Promise<any[]>;
        upsertWithReplace(data: unknown[], config?: import("@medusajs/framework/types").UpsertWithReplaceConfig<any> | undefined, context?: Context): Promise<{
            entities: any[];
            performedActions: import("@medusajs/framework/types").PerformedActions;
        }>;
        softDelete(filters: string | string[] | (import("@medusajs/types/dist/dal/utils").FilterQueryProperties<EntitySchema<any, never>, 3> & import("@medusajs/framework/types").BaseFilterable<import("@medusajs/types/dist/dal/utils").FilterQueryProperties<EntitySchema<any, never>, 3>>) | (import("@medusajs/types/dist/dal/utils").FilterQueryProperties<EntitySchema<any, never>, 3> & import("@medusajs/framework/types").BaseFilterable<import("@medusajs/types/dist/dal/utils").FilterQueryProperties<EntitySchema<any, never>, 3>>)[], sharedContext?: Context): Promise<[any[], Record<string, unknown[]>]>;
        restore(idsOrFilter: string[] | import("@medusajs/framework/types").FilterQuery, sharedContext?: Context): Promise<[any[], Record<string, unknown[]>]>;
        readonly manager_: any;
        getFreshManager<TManager = unknown>(): TManager;
        getActiveManager<TManager = unknown>({ transactionManager, manager, }?: Context): TManager;
        transaction<TManager = unknown>(task: (transactionManager: TManager) => Promise<any>, options?: {
            isolationLevel?: string;
            enableNestedTransactions?: boolean;
            transaction?: TManager;
        }): Promise<any>;
        serialize<TOutput extends object | object[]>(data: any, options?: any): Promise<TOutput>;
    };
};
//# sourceMappingURL=link.d.ts.map