import type { CacheAdapter } from './CacheAdapter';
import type { Dictionary } from '../typings';
export declare class GeneratedCacheAdapter implements CacheAdapter {
    private readonly options;
    private readonly data;
    constructor(options: {
        data: Dictionary;
    });
    /**
     * @inheritDoc
     */
    get<T = any>(name: string): T | undefined;
    /**
     * @inheritDoc
     */
    set(name: string, data: any, origin: string): void;
    /**
     * @inheritDoc
     */
    remove(name: string): void;
    /**
     * @inheritDoc
     */
    clear(): void;
}
