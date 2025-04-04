var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Promotion {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    retrieve(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/promotions/${id}`, {
                headers,
                query,
            });
        });
    }
    list(query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/promotions`, {
                headers,
                query,
            });
        });
    }
    create(payload, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/promotions`, {
                method: "POST",
                headers,
                body: payload,
            });
        });
    }
    update(id, payload, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/promotions/${id}`, {
                method: "POST",
                headers,
                body: payload,
            });
        });
    }
    delete(id, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/promotions/${id}`, {
                method: "DELETE",
                headers,
            });
        });
    }
    addRules(id, ruleType, payload, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/promotions/${id}/${ruleType}/batch`, {
                method: "POST",
                headers,
                body: { create: payload.rules },
            });
        });
    }
    updateRules(id, ruleType, payload, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/promotions/${id}/${ruleType}/batch`, {
                method: "POST",
                headers,
                body: { update: payload.rules },
            });
        });
    }
    removeRules(id, ruleType, payload, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/promotions/${id}/${ruleType}/batch`, {
                method: "POST",
                headers,
                body: { delete: payload.rule_ids },
            });
        });
    }
    listRules(id, ruleType, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line max-len
            return yield this.client.fetch(`/admin/promotions/${id}/${ruleType}`, {
                headers,
                query,
            });
        });
    }
    listRuleAttributes(ruleType, promotionType, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line max-len
            return yield this.client.fetch(`/admin/promotions/rule-attribute-options/${ruleType}`, {
                headers,
                query: { promotion_type: promotionType },
            });
        });
    }
    listRuleValues(ruleType, ruleValue, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/promotions/rule-value-options/${ruleType}/${ruleValue}`, {
                headers,
                query,
            });
        });
    }
}
//# sourceMappingURL=promotion.js.map