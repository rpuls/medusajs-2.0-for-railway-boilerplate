"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Reservation {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async retrieve(id, query, headers) {
        return await this.client.fetch(`/admin/reservations/${id}`, {
            method: "GET",
            headers,
            query,
        });
    }
    async list(query, headers) {
        return await this.client.fetch("/admin/reservations", {
            method: "GET",
            query,
            headers,
        });
    }
    async create(body, query, headers) {
        return await this.client.fetch("/admin/reservations", {
            method: "POST",
            body,
            query,
            headers,
        });
    }
    async update(id, body, query, headers) {
        return await this.client.fetch(`/admin/reservations/${id}`, {
            method: "POST",
            body,
            query,
            headers,
        });
    }
    async delete(id, headers) {
        return await this.client.fetch(`/admin/reservations/${id}`, {
            method: "DELETE",
            headers,
        });
    }
}
exports.default = Reservation;
//# sourceMappingURL=reservation.js.map