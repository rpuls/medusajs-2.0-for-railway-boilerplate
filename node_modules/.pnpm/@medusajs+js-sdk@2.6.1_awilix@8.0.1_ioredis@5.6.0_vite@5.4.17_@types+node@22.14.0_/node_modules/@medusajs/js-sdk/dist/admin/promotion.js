"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Promotion = void 0;
class Promotion {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async retrieve(id, query, headers) {
        return await this.client.fetch(`/admin/promotions/${id}`, {
            headers,
            query,
        });
    }
    async list(query, headers) {
        return await this.client.fetch(`/admin/promotions`, {
            headers,
            query,
        });
    }
    async create(payload, headers) {
        return await this.client.fetch(`/admin/promotions`, {
            method: "POST",
            headers,
            body: payload,
        });
    }
    async update(id, payload, headers) {
        return await this.client.fetch(`/admin/promotions/${id}`, {
            method: "POST",
            headers,
            body: payload,
        });
    }
    async delete(id, headers) {
        return await this.client.fetch(`/admin/promotions/${id}`, {
            method: "DELETE",
            headers,
        });
    }
    async addRules(id, ruleType, payload, headers) {
        return await this.client.fetch(`/admin/promotions/${id}/${ruleType}/batch`, {
            method: "POST",
            headers,
            body: { create: payload.rules },
        });
    }
    async updateRules(id, ruleType, payload, headers) {
        return await this.client.fetch(`/admin/promotions/${id}/${ruleType}/batch`, {
            method: "POST",
            headers,
            body: { update: payload.rules },
        });
    }
    async removeRules(id, ruleType, payload, headers) {
        return await this.client.fetch(`/admin/promotions/${id}/${ruleType}/batch`, {
            method: "POST",
            headers,
            body: { delete: payload.rule_ids },
        });
    }
    async listRules(id, ruleType, query, headers) {
        // eslint-disable-next-line max-len
        return await this.client.fetch(`/admin/promotions/${id}/${ruleType}`, {
            headers,
            query,
        });
    }
    async listRuleAttributes(ruleType, promotionType, headers) {
        // eslint-disable-next-line max-len
        return await this.client.fetch(`/admin/promotions/rule-attribute-options/${ruleType}`, {
            headers,
            query: { promotion_type: promotionType },
        });
    }
    async listRuleValues(ruleType, ruleValue, query, headers) {
        return await this.client.fetch(`/admin/promotions/rule-value-options/${ruleType}/${ruleValue}`, {
            headers,
            query,
        });
    }
}
exports.Promotion = Promotion;
//# sourceMappingURL=promotion.js.map