"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesChannel = void 0;
class SalesChannel {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async create(body, query, headers) {
        return await this.client.fetch(`/admin/sales-channels`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async update(id, body, query, headers) {
        return await this.client.fetch(`/admin/sales-channels/${id}`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async delete(id, headers) {
        return await this.client.fetch(`/admin/sales-channels/${id}`, {
            method: "DELETE",
            headers,
        });
    }
    async retrieve(id, query, headers) {
        return await this.client.fetch(`/admin/sales-channels/${id}`, {
            method: "GET",
            headers,
            query,
        });
    }
    async list(query, headers) {
        return await this.client.fetch(`/admin/sales-channels`, {
            method: "GET",
            headers,
            query,
        });
    }
    async updateProducts(id, body, headers) {
        return await this.client.fetch(`/admin/sales-channels/${id}/products`, {
            method: "POST",
            headers,
            body,
        });
    }
    async batchProducts(id, body, headers) {
        return await this.client.fetch(`/admin/sales-channels/${id}/products`, {
            method: "POST",
            headers,
            body,
        });
    }
}
exports.SalesChannel = SalesChannel;
//# sourceMappingURL=sales-channel.js.map