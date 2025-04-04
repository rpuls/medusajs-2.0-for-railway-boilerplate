"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Return = void 0;
class Return {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async list(query, headers) {
        return await this.client.fetch(`/admin/returns`, {
            query,
            headers,
        });
    }
    async retrieve(id, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}`, {
            query,
            headers,
        });
    }
    async initiateRequest(body, query, headers) {
        return await this.client.fetch(`/admin/returns`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async cancel(id, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/cancel`, {
            method: "POST",
            headers,
            query,
        });
    }
    async cancelRequest(id, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/request`, {
            method: "DELETE",
            headers,
            query,
        });
    }
    async addReturnItem(id, body, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/request-items`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async updateReturnItem(id, actionId, body, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/request-items/${actionId}`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async removeReturnItem(id, actionId, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/request-items/${actionId}`, {
            method: "DELETE",
            headers,
            query,
        });
    }
    async addReturnShipping(id, body, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/shipping-method`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async updateReturnShipping(id, actionId, body, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/shipping-method/${actionId}`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async deleteReturnShipping(id, actionId, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/shipping-method/${actionId}`, {
            method: "DELETE",
            headers,
            query,
        });
    }
    async updateRequest(id, body, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async confirmRequest(id, body, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/request`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async initiateReceive(id, body, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/receive`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async receiveItems(id, body, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/receive-items`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async updateReceiveItem(id, actionId, body, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/receive-items/${actionId}`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async removeReceiveItem(id, actionId, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/receive-items/${actionId}`, {
            method: "DELETE",
            headers,
            query,
        });
    }
    async dismissItems(id, body, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/dismiss-items`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async updateDismissItem(id, actionId, body, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/dismiss-items/${actionId}`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async removeDismissItem(id, actionId, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/dismiss-items/${actionId}`, {
            method: "DELETE",
            headers,
            query,
        });
    }
    async confirmReceive(id, body, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/receive/confirm`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async cancelReceive(id, query, headers) {
        return await this.client.fetch(`/admin/returns/${id}/receive`, {
            method: "DELETE",
            headers,
            query,
        });
    }
}
exports.Return = Return;
//# sourceMappingURL=return.js.map