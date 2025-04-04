"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingOption = void 0;
class ShippingOption {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async create(body, query, headers) {
        return await this.client.fetch(`/admin/shipping-options`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async retrieve(id, query, headers) {
        return await this.client.fetch(`/admin/shipping-options/${id}`, {
            method: "GET",
            headers,
            query,
        });
    }
    async update(id, body, query, headers) {
        return await this.client.fetch(`/admin/shipping-options/${id}`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async delete(id, headers) {
        return await this.client.fetch(`/admin/shipping-options/${id}`, {
            method: "DELETE",
            headers,
        });
    }
    async list(query, headers) {
        return await this.client.fetch(`/admin/shipping-options`, {
            method: "GET",
            headers,
            query,
        });
    }
    async updateRules(id, body, headers) {
        return await this.client.fetch(`/admin/shipping-options/${id}/rules/batch`, {
            method: "POST",
            headers,
            body,
        });
    }
}
exports.ShippingOption = ShippingOption;
//# sourceMappingURL=shipping-option.js.map