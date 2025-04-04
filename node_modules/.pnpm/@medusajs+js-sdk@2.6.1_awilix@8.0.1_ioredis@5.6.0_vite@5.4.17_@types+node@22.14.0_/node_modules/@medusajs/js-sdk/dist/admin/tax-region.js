"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxRegion = void 0;
const taxRegionUrl = "/admin/tax-regions";
// TODO: Add support for updating a tax region
class TaxRegion {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async create(body, query, headers) {
        return await this.client.fetch(taxRegionUrl, {
            method: "POST",
            headers,
            body,
            query,
        });
    }
    async delete(id, headers) {
        return await this.client.fetch(`${taxRegionUrl}/${id}`, {
            method: "DELETE",
            headers,
        });
    }
    async retrieve(id, query, headers) {
        return await this.client.fetch(`${taxRegionUrl}/${id}`, {
            method: "GET",
            headers,
            query,
        });
    }
    async list(query, headers) {
        return await this.client.fetch(taxRegionUrl, {
            method: "GET",
            headers,
            query,
        });
    }
}
exports.TaxRegion = TaxRegion;
//# sourceMappingURL=tax-region.js.map