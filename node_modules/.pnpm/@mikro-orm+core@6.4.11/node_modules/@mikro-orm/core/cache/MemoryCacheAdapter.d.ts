import type { CacheAdapter } from './CacheAdapter';
export declare class MemoryCacheAdapter implements CacheAdapter {
    private readonly options;
    private readonly data;
    constructor(options: {
        expiration: number;
    });
    /**
     * @inheritDoc
     */
    get<T = any>(name: string): T | undefined;
    /**
     * @inheritDoc
     */
    set(name: string, data: any, origin: string, expiration?: number): void;
    /**
     * @inheritDoc
     */
    remove(name: string): void;
    /**
     * @inheritDoc
     */
    clear(): void;
}
