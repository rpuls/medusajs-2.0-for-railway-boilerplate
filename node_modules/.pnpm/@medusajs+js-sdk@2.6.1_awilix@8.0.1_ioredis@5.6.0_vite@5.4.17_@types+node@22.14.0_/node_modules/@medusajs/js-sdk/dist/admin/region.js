"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region = void 0;
class Region {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async create(body, query, headers) {
        return await this.client.fetch(`/admin/regions`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async update(id, body, query, headers) {
        return await this.client.fetch(`/admin/regions/${id}`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async list(queryParams, headers) {
        return await this.client.fetch(`/admin/regions`, {
            query: queryParams,
            headers,
        });
    }
    async retrieve(id, query, headers) {
        return await this.client.fetch(`/admin/regions/${id}`, {
            query,
            headers,
        });
    }
    async delete(id, headers) {
        return await this.client.fetch(`/admin/regions/${id}`, {
            method: "DELETE",
            headers,
        });
    }
}
exports.Region = Region;
//# sourceMappingURL=region.js.map