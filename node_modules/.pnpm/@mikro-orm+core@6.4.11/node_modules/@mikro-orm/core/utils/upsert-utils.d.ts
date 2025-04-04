import type { EntityData, EntityMetadata } from '../typings';
import type { UpsertOptions } from '../drivers/IDatabaseDriver';
import type { RawQueryFragment } from '../utils/RawQueryFragment';
/** @internal */
export declare function getOnConflictFields<T>(meta: EntityMetadata<T> | undefined, data: EntityData<T>, uniqueFields: (keyof T)[] | RawQueryFragment, options: UpsertOptions<T>): (keyof T)[];
/** @internal */
export declare function getOnConflictReturningFields<T, P extends string>(meta: EntityMetadata<T> | undefined, data: EntityData<T>, uniqueFields: (keyof T)[] | RawQueryFragment, options: UpsertOptions<T, P>): (keyof T)[] | '*';
