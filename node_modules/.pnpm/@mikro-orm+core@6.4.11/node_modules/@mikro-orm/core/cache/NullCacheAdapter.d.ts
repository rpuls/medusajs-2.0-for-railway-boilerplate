import type { SyncCacheAdapter } from './CacheAdapter';
export declare class NullCacheAdapter implements SyncCacheAdapter {
    /**
     * @inheritDoc
     */
    get(name: string): any;
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
