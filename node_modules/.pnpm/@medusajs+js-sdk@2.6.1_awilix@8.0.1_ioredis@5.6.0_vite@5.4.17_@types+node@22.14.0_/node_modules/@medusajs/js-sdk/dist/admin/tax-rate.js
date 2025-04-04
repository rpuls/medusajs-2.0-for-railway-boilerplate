"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxRate = void 0;
const taxRateUrl = "/admin/tax-rates";
class TaxRate {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async create(body, query, headers) {
        return await this.client.fetch(taxRateUrl, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async update(id, body, query, headers) {
        return await this.client.fetch(`${taxRateUrl}/${id}`, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async delete(id, headers) {
        return await this.client.fetch(`${taxRateUrl}/${id}`, {
            method: "DELETE",
            headers,
        });
    }
    async retrieve(id, query, headers) {
        return await this.client.fetch(`${taxRateUrl}/${id}`, {
            method: "GET",
            headers,
            query,
        });
    }
    async list(query, headers) {
        return await this.client.fetch(taxRateUrl, {
            method: "GET",
            headers,
            query,
        });
    }
}
exports.TaxRate = TaxRate;
//# sourceMappingURL=tax-rate.js.map