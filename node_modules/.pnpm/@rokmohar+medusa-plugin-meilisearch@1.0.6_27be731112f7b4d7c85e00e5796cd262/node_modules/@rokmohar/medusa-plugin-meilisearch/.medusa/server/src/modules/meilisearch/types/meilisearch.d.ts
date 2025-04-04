import { SearchTypes } from '@medusajs/types';
import { Config } from 'meilisearch';
export declare const meilisearchErrorCodes: {
    INDEX_NOT_FOUND: string;
};
export interface MeilisearchPluginOptions {
    /**
     * Meilisearch client configuration
     */
    config: Config;
    /**
     * Index settings
     */
    settings?: {
        [key: string]: SearchTypes.IndexSettings;
    };
}
//# sourceMappingURL=meilisearch.d.ts.map