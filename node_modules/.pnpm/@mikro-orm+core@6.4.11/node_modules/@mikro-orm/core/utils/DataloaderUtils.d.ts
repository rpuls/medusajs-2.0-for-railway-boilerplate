import type { Primary, Ref } from '../typings';
import { Collection, type InitCollectionOptions } from '../entity/Collection';
import { type EntityManager } from '../EntityManager';
import type DataLoader from 'dataloader';
import { DataloaderType } from '../enums';
import { type LoadReferenceOptions } from '../entity/Reference';
export declare class DataloaderUtils {
    /**
     * Groups identified references by entity and returns a Map with the
     * class name as the index and the corresponding primary keys as the value.
     */
    static groupPrimaryKeysByEntityAndOpts(refsWithOpts: readonly [Ref<any>, Omit<LoadReferenceOptions<any, any>, 'dataloader'>?][]): Map<string, Set<Primary<any>>>;
    /**
     * Returns the reference dataloader batchLoadFn, which aggregates references by entity,
     * makes one query per entity and maps each input reference to the corresponding result.
     */
    static getRefBatchLoadFn(em: EntityManager): DataLoader.BatchLoadFn<[Ref<any>, Omit<LoadReferenceOptions<any, any>, 'dataloader'>?], any>;
    /**
     * Groups collections by entity and returns a Map whose keys are the entity names and whose values are filter Maps
     * which we can use to narrow down the find query to return just the items of the collections that have been dataloaded.
     * The entries of the filter Map will be used as the values of an $or operator so we end up with a query per entity.
     */
    static groupInversedOrMappedKeysByEntityAndOpts(collsWithOpts: readonly [Collection<any>, Omit<InitCollectionOptions<any, any>, 'dataloader'>?][]): Map<string, Map<string, Set<Primary<any>>>>;
    /**
     * Turn the entity+options map into actual queries.
     * The keys are the entity names + a stringified version of the options and the values are filter Maps which will be used as the values of an $or operator so we end up with a query per entity+opts.
     * We must populate the inverse side of the relationship in order to be able to later retrieve the PK(s) from its item(s).
     * Together with the query the promises will also return the key which can be used to narrow down the results pertaining to a certain set of options.
     */
    static entitiesAndOptsMapToQueries(entitiesAndOptsMap: Map<string, Map<string, Set<Primary<any>>>>, em: EntityManager): Promise<[string, any[]]>[];
    /**
     * Creates a filter which returns the results pertaining to a certain collection.
     * First checks if the Entity type matches, then retrieves the inverse side of the relationship
     * where the filtering will be done in order to match the target collection.
     */
    static getColFilter<T, S extends T>(collection: Collection<any>): (result: T) => result is S;
    /**
     * Returns the collection dataloader batchLoadFn, which aggregates collections by entity,
     * makes one query per entity and maps each input collection to the corresponding result.
     */
    static getColBatchLoadFn(em: EntityManager): DataLoader.BatchLoadFn<[Collection<any>, Omit<InitCollectionOptions<any, any>, 'dataloader'>?], any>;
    static getDataloaderType(dataloaderCfg: DataloaderType | boolean): DataloaderType;
}
