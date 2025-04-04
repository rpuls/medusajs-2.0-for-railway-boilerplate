"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeiliSearchService = void 0;
const utils_1 = require("@medusajs/utils");
const meilisearch_1 = require("meilisearch");
const types_1 = require("../types");
const transformer_1 = require("../utils/transformer");
class MeiliSearchService extends utils_1.SearchUtils.AbstractSearchService {
    constructor(container, options) {
        super(container, options);
        this.isDefault = false;
        this.config_ = options;
        if (process.env.NODE_ENV !== 'development') {
            if (!options.config?.apiKey) {
                throw Error('Meilisearch API key is missing in plugin config. See https://github.com/rokmohar/medusa-plugin-meilisearch');
            }
        }
        if (!options.config?.host) {
            throw Error('Meilisearch host is missing in plugin config. See https://github.com/rokmohar/medusa-plugin-meilisearch');
        }
        this.client_ = new meilisearch_1.MeiliSearch(options.config);
    }
    async createIndex(indexName, options = { primaryKey: 'id' }) {
        return await this.client_.createIndex(indexName, options);
    }
    getIndex(indexName) {
        return this.client_.index(indexName);
    }
    async addDocuments(indexName, documents, type) {
        const transformedDocuments = this.getTransformedDocuments(type, documents);
        return await this.client_.index(indexName).addDocuments(transformedDocuments, { primaryKey: 'id' });
    }
    async replaceDocuments(indexName, documents, type) {
        const transformedDocuments = this.getTransformedDocuments(type, documents);
        return await this.client_.index(indexName).addDocuments(transformedDocuments, { primaryKey: 'id' });
    }
    async deleteDocument(indexName, documentId) {
        return await this.client_.index(indexName).deleteDocument(documentId);
    }
    async deleteDocuments(indexName, documentIds) {
        return await this.client_.index(indexName).deleteDocuments(documentIds);
    }
    async deleteAllDocuments(indexName) {
        return await this.client_.index(indexName).deleteAllDocuments();
    }
    async search(indexName, query, options) {
        const { paginationOptions, filter, additionalOptions } = options;
        return await this.client_.index(indexName).search(query, { filter, ...paginationOptions, ...additionalOptions });
    }
    async updateSettings(indexName, settings) {
        const indexSettings = settings.indexSettings ?? {};
        await this.upsertIndex(indexName, settings);
        return await this.client_.index(indexName).updateSettings(indexSettings);
    }
    async upsertIndex(indexName, settings) {
        try {
            await this.client_.getIndex(indexName);
        }
        catch (error) {
            if (error.code === types_1.meilisearchErrorCodes.INDEX_NOT_FOUND) {
                await this.createIndex(indexName, {
                    primaryKey: settings?.primaryKey ?? 'id',
                });
            }
        }
    }
    getTransformedDocuments(type, documents) {
        if (!documents?.length) {
            return [];
        }
        switch (type) {
            case utils_1.SearchUtils.indexTypes.PRODUCTS:
                const productsTransformer = this.config_.settings?.[utils_1.SearchUtils.indexTypes.PRODUCTS]?.transformer ?? transformer_1.transformProduct;
                return documents.map(productsTransformer);
            default:
                return documents;
        }
    }
}
exports.MeiliSearchService = MeiliSearchService;
MeiliSearchService.identifier = 'index-meilisearch';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVpbGlzZWFyY2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbW9kdWxlcy9tZWlsaXNlYXJjaC9zZXJ2aWNlcy9tZWlsaXNlYXJjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwyQ0FBNkM7QUFDN0MsNkNBQW1EO0FBQ25ELG9DQUEwRTtBQUMxRSxzREFBdUQ7QUFFdkQsTUFBYSxrQkFBbUIsU0FBUSxtQkFBVyxDQUFDLHFCQUFxQjtJQVF2RSxZQUFZLFNBQWMsRUFBRSxPQUFpQztRQUMzRCxLQUFLLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBTjNCLGNBQVMsR0FBRyxLQUFLLENBQUE7UUFRZixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQTtRQUV0QixJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLGFBQWEsRUFBRSxDQUFDO1lBQzNDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxDQUFDO2dCQUM1QixNQUFNLEtBQUssQ0FDVCw0R0FBNEcsQ0FDN0csQ0FBQTtZQUNILENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLENBQUM7WUFDMUIsTUFBTSxLQUFLLENBQ1QseUdBQXlHLENBQzFHLENBQUE7UUFDSCxDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLHlCQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2hELENBQUM7SUFFRCxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQWlCLEVBQUUsVUFBbUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFO1FBQzFGLE9BQU8sTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDM0QsQ0FBQztJQUVELFFBQVEsQ0FBQyxTQUFpQjtRQUN4QixP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