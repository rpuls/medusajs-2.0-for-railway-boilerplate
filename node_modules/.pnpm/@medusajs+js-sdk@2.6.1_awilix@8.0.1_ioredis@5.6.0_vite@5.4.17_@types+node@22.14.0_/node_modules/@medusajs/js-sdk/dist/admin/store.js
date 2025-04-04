"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
class Store {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async retrieve(id, query, headers) {
        return await this.client.fetch(`/admin/stores/${id}`, {
            method: "GET",
            headers,
            query,
        });
    }
    async list(query, headers) {
        return await this.client.fetch(`/admin/stores`, {
            method: "GET",
            headers,
            query,
        });
    }
    async update(id, body, query, headers) {
        return await this.client.fetch(`/admin/stores/${id}`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
}
exports.Store = Store;
//# sourceMappingURL=store.js.map