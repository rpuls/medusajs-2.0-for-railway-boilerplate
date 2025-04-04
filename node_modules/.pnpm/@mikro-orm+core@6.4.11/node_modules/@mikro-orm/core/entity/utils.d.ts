import type { EntityMetadata, PopulateOptions } from '../typings';
/**
 * @internal
 */
export declare function expandDotPaths<Entity>(meta: EntityMetadata<Entity>, populate?: readonly (string | PopulateOptions<Entity>)[], normalized?: boolean): PopulateOptions<Entity>[];
