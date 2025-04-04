var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class StockLocation {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    create(body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/stock-locations`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    update(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/stock-locations/${id}`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    delete(id, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/stock-locations/${id}`, {
                method: "DELETE",
                headers,
            });
        });
    }
    retrieve(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/stock-locations/${id}`, {
                method: "GET",
                headers,
                query,
            });
        });
    }
    list(query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/stock-locations`, {
                method: "GET",
                headers,
                query,
            });
        });
    }
    updateSalesChannels(id, body, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/stock-locations/${id}/sales-channels`, {
                method: "POST",
                headers,
                body,
            });
        });
    }
    createFulfillmentSet(id, body, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/stock-locations/${id}/fulfillment-sets`, {
                method: "POST",
                headers,
                body,
            });
        });
    }
    updateFulfillmentProviders(id, body, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/stock-locations/${id}/fulfillment-providers`, {
                method: "POST",
                headers,
                body,
            });
        });
    }
}
//# sourceMappingURL=stock-location.js.map