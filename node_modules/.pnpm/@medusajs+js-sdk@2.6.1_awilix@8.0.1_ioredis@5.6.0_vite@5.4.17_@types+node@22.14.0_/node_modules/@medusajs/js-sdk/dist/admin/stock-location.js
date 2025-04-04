"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockLocation = void 0;
class StockLocation {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async create(body, query, headers) {
        return await this.client.fetch(`/admin/stock-locations`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async update(id, body, query, headers) {
        return await this.client.fetch(`/admin/stock-locations/${id}`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async delete(id, headers) {
        return await this.client.fetch(`/admin/stock-locations/${id}`, {
            method: "DELETE",
            headers,
        });
    }
    async retrieve(id, query, headers) {
        return await this.client.fetch(`/admin/stock-locations/${id}`, {
            method: "GET",
            headers,
            query,
        });
    }
    async list(query, headers) {
        return await this.client.fetch(`/admin/stock-locations`, {
            method: "GET",
            headers,
            query,
        });
    }
    async updateSalesChannels(id, body, headers) {
        return await this.client.fetch(`/admin/stock-locations/${id}/sales-channels`, {
            method: "POST",
            headers,
            body,
        });
    }
    async createFulfillmentSet(id, body, headers) {
        return await this.client.fetch(`/admin/stock-locations/${id}/fulfillment-sets`, {
            method: "POST",
            headers,
            body,
        });
    }
    async updateFulfillmentProviders(id, body, headers) {
        return await this.client.fetch(`/admin/stock-locations/${id}/fulfillment-providers`, {
            method: "POST",
            headers,
            body,
        });
    }
}
exports.StockLocation = StockLocation;
//# sourceMappingURL=stock-location.js.map