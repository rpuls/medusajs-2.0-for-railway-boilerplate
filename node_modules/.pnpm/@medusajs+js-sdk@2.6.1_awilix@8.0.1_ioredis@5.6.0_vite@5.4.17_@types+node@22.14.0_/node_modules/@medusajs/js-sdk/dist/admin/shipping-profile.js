"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingProfile = void 0;
class ShippingProfile {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async create(body, query, headers) {
        return await this.client.fetch(`/admin/shipping-profiles`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async update(id, body, query, headers) {
        return await this.client.fetch(`/admin/shipping-profiles/${id}`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async delete(id, headers) {
        return await this.client.fetch(`/admin/shipping-profiles/${id}`, {
            method: "DELETE",
            headers,
        });
    }
    async list(query, headers) {
        return await this.client.fetch(`/admin/shipping-profiles`, {
            method: "GET",
            headers,
            query,
        });
    }
    async retrieve(id, query, headers) {
        return await this.client.fetch(`/admin/shipping-profiles/${id}`, {
            method: "GET",
            headers,
            query,
        });
    }
}
exports.ShippingProfile = ShippingProfile;
//# sourceMappingURL=shipping-profile.js.map