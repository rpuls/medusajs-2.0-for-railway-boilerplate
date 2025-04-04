import type { EntityMetadata } from '../typings';
import type { Logger } from '../logging/Logger';
export interface IConfiguration {
    get(key: string, defaultValue?: any): any;
    getLogger(): Logger;
}
export declare abstract class MetadataProvider {
    protected readonly config: IConfiguration;
    constructor(config: IConfiguration);
    abstract loadEntityMetadata(meta: EntityMetadata, name: string): void;
    loadFromCache(meta: EntityMetadata, cache: EntityMetadata): void;
    useCache(): boolean;
}
