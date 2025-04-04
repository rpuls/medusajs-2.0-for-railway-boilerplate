import type { ConnectionType, Dictionary, FilterQuery, PopulateOptions } from '../typings';
import type { EntityManager } from '../EntityManager';
import { LoadStrategy, type LockMode, type PopulateHint, PopulatePath, type QueryOrderMap } from '../enums';
import type { EntityField } from '../drivers/IDatabaseDriver';
import type { LoggingOptions } from '../logging/Logger';
export type EntityLoaderOptions<Entity, Fields extends string = PopulatePath.ALL, Excludes extends string = never> = {
    where?: FilterQuery<Entity>;
    populateWhere?: PopulateHint | `${PopulateHint}`;
    fields?: readonly EntityField<Entity, Fields>[];
    exclude?: readonly EntityField<Entity, Excludes>[];
    orderBy?: QueryOrderMap<Entity> | QueryOrderMap<Entity>[];
    refresh?: boolean;
    validate?: boolean;
    lookup?: boolean;
    convertCustomTypes?: boolean;
    ignoreLazyScalarProperties?: boolean;
    filters?: Dictionary<boolean | Dictionary> | string[] | boolean;
    strategy?: LoadStrategy;
    lockMode?: Exclude<LockMode, LockMode.OPTIMISTIC>;
    schema?: string;
    connectionType?: ConnectionType;
    logging?: LoggingOptions;
};
export declare class EntityLoader {
    private readonly em;
    private readonly metadata;
    private readonly driver;
    constructor(em: EntityManager);
    /**
     * Loads specified relations in batch.
     * This will execute one query for each relation, that will populate it on all the specified entities.
     */
    populate<Entity extends object, Fields extends string = PopulatePath.ALL>(entityName: string, entities: Entity[], populate: PopulateOptions<Entity>[] | boolean, options: EntityLoaderOptions<Entity, Fields>): Promise<void>;
    normalizePopulate<Entity>(entityName: string, populate: (PopulateOptions<Entity> | boolean)[] | PopulateOptions<Entity> | boolean, strategy?: LoadStrategy, lookup?: boolean): PopulateOptions<Entity>[];
    private setSerializationContext;
    /**
     * Merge multiple populates for the same entity with different children. Also skips `*` fields, those can come from
     * partial loading hints (`fields`) that are used to infer the `populate` hint if missing.
     */
    private mergeNestedPopulate;
    /**
     * preload everything in one call (this will update already existing references in IM)
     */
    private populateMany;
    private populateScalar;
    private initializeCollections;
    private initializeOneToMany;
    private initializeManyToMany;
    private findChildren;
    private mergePrimaryCondition;
    private populateField;
    private findChildrenFromPivotTable;
    private extractChildCondition;
    private buildFields;
    private getChildReferences;
    private filterCollections;
    private isPropertyLoaded;
    private filterReferences;
    private filterByReferences;
    private lookupAllRelationships;
    private getRelationName;
    private lookupEagerLoadedRelationships;
}
