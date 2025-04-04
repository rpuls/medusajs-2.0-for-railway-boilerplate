"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnReason = void 0;
class ReturnReason {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async list(query, headers) {
        return await this.client.fetch("/admin/return-reasons", {
            headers,
            query,
        });
    }
    async retrieve(id, query, headers) {
        return await this.client.fetch(`/admin/return-reasons/${id}`, {
            query,
            headers,
        });
    }
    async create(body, query, headers) {
        return this.client.fetch(`/admin/return-reasons`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async update(id, body, query, headers) {
        return this.client.fetch(`/admin/return-reasons/${id}`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async delete(id, query, headers) {
        return await this.client.fetch(`/admin/return-reasons/${id}`, {
            method: "DELETE",
            headers,
            query,
        });
    }
}
exports.ReturnReason = ReturnReason;
//# sourceMappingURL=return-reason.js.map