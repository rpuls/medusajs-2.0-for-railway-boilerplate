import { Context, DAL, FindOptions, InferEntityType, InferRepositoryReturnType, FilterQuery as InternalFilterQuery, PerformedActions, RepositoryService, RepositoryTransformOptions, UpsertWithReplaceConfig } from "@medusajs/types";
import { EntityClass, EntitySchema } from "@mikro-orm/core";
export declare class MikroOrmBase {
    readonly manager_: any;
    protected constructor({ manager }: {
        manager: any;
    });
    getFreshManager<TManager = unknown>(): TManager;
    getActiveManager<TManager = unknown>({ transactionManager, manager, }?: Context): TManager;
    transaction<TManager = unknown>(task: (transactionManager: TManager) => Promise<any>, options?: {
        isolationLevel?: string;
        enableNestedTransactions?: boolean;
        transaction?: TManager;
    }): Promise<any>;
    serialize<TOutput extends object | object[]>(data: any, options?: any): Promise<TOutput>;
}
/**
 * Privileged extends of the abstract classes unless most of the methods can't be implemented
 * in your repository. This base repository is also used to provide a base repository
 * injection if needed to be able to use the common methods without being related to an entity.
 * In this case, none of the method will be implemented except the manager and transaction
 * related ones.
 */
export declare class MikroOrmBaseRepository<const T extends object = object> extends MikroOrmBase implements RepositoryService<T> {
    entity: EntityClass<InferEntityType<T>>;
    constructor(...args: any[]);
    static buildUniqueCompositeKeyValue(keys: string[], data: object): string;
    static retrievePrimaryKeys(entity: EntityClass<any> | EntitySchema): string[];
    /**
     * When using the select-in strategy, the populated fields are not selected by default unlike when using the joined strategy.
     * This method will add the populated fields to the fields array if they are not already specifically selected.
     *
     * TODO: Revisit if this is still needed in v6 as it seems to be a workaround for a bug in v5
     *
     * @param {FindOptions<any>} findOptions
     */
    static compensateRelationFieldsSelectionFromLoadStrategy({ findOptions, }: {
        findOptions: DAL.FindOptions;
    }): void;
    create(data: unknown[], context?: Context): Promise<InferRepositoryReturnType<T>[]>;
    update(data: {
        entity: any;
        update: any;
    }[], context?: Context): Promise<InferRepositoryReturnType<T>[]>;
    delete(idsOrPKs: FindOptions<T>["where"], context?: Context): Promise<string[]>;
    find(options?: DAL.FindOptions<T>, context?: Context): Promise<InferRepositoryReturnType<T>[]>;
    findAndCount(options?: DAL.FindOptions<T>, context?: Context): Promise<[InferRepositoryReturnType<T>[], number]>;
    upsert(data: unknown[], context?: Context): Promise<InferRepositoryReturnType<T>[]>;
    upsertWithReplace(data: unknown[], config?: UpsertWithReplaceConfig<InferRepositoryReturnType<T>>, context?: Context): Promise<{
        entities: InferRepositoryReturnType<T>[];
        performedActions: PerformedActions;
    }>;
    softDelete(filters: string | string[] | DAL.FindOptions<T>["where"] | DAL.FindOptions<T>["where"][], sharedContext?: Context): Promise<[InferRepositoryReturnType<T>[], Record<string, unknown[]>]>;
    restore(idsOrFilter: string[] | InternalFilterQuery, sharedContext?: Context): Promise<[InferRepositoryReturnType<T>[], Record<string, unknown[]>]>;
}
export declare class MikroOrmBaseTreeRepository<const T extends object = object> extends MikroOrmBase {
    constructor();
    find(options?: DAL.FindOptions, transformOptions?: RepositoryTransformOptions, context?: Context): Promise<InferRepositoryReturnType<T>[]>;
    findAndCount(options?: DAL.FindOptions, transformOptions?: RepositoryTransformOptions, context?: Context): Promise<[InferRepositoryReturnType<T>[], number]>;
    create(data: unknown[], context?: Context): Promise<InferRepositoryReturnType<T>[]>;
    update(data: unknown[], context?: Context): Promise<InferRepositoryReturnType<T>[]>;
    delete(ids: string[], context?: Context): Promise<string[]>;
}
export declare function mikroOrmBaseRepositoryFactory<const T extends object>(entity: T): {
    new ({ manager }: {
        manager: any;
    }): MikroOrmBaseRepository<T>;
};
//# sourceMappingURL=mikro-orm-repository.d.ts.map