import { SearchTypes } from '@medusajs/types';
import { SearchUtils } from '@medusajs/utils';
import { MeiliSearch, Settings } from 'meilisearch';
import { MeilisearchPluginOptions } from '../types';
export declare class MeiliSearchService extends SearchUtils.AbstractSearchService {
    static identifier: string;
    isDefault: boolean;
    protected readonly config_: MeilisearchPluginOptions;
    protected readonly client_: MeiliSearch;
    constructor(container: any, options: MeilisearchPluginOptions);
    createIndex(indexName: string, options?: Record<string, unknown>): Promise<import("meilisearch").EnqueuedTask>;
    getIndex(indexName: string): import("meilisearch").Index<Record<string, any>>;
    addDocuments(indexName: string, documents: any, type: string): Promise<import("meilisearch").EnqueuedTask>;
    replaceDocuments(indexName: string, documents: any, type: string): Promise<import("meilisearch").EnqueuedTask>;
    deleteDocument(indexName: string, documentId: string): Promise<import("meilisearch").EnqueuedTask>;
    deleteDocuments(indexName: string, documentIds: string[]): Promise<import("meilisearch").EnqueuedTask>;
    deleteAllDocuments(indexName: string): Promise<import("meilisearch").EnqueuedTask>;
    search(indexName: string, query: string, options: Record<string, any>): Promise<import("meilisearch").SearchResponse<Record<string, any>, any>>;
    updateSettings(indexName: string, settings: SearchTypes.IndexSettings & Settings): Promise<import("meilisearch").EnqueuedTask>;
    upsertIndex(indexName: string, settings: SearchTypes.IndexSettings): Promise<void>;
    getTransformedDocuments(type: string, documents: any[]): any[];
}
//# sourceMappingURL=meilisearch.d.ts.map