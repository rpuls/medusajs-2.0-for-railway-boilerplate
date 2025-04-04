var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Return {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    list(query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns`, {
                query,
                headers,
            });
        });
    }
    retrieve(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}`, {
                query,
                headers,
            });
        });
    }
    initiateRequest(body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    cancel(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/cancel`, {
                method: "POST",
                headers,
                query,
            });
        });
    }
    cancelRequest(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/request`, {
                method: "DELETE",
                headers,
                query,
            });
        });
    }
    addReturnItem(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/request-items`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    updateReturnItem(id, actionId, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/request-items/${actionId}`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    removeReturnItem(id, actionId, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/request-items/${actionId}`, {
                method: "DELETE",
                headers,
                query,
            });
        });
    }
    addReturnShipping(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/shipping-method`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    updateReturnShipping(id, actionId, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/shipping-method/${actionId}`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    deleteReturnShipping(id, actionId, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/shipping-method/${actionId}`, {
                method: "DELETE",
                headers,
                query,
            });
        });
    }
    updateRequest(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    confirmRequest(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/request`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    initiateReceive(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/receive`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    receiveItems(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/receive-items`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    updateReceiveItem(id, actionId, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/receive-items/${actionId}`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    removeReceiveItem(id, actionId, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/receive-items/${actionId}`, {
                method: "DELETE",
                headers,
                query,
            });
        });
    }
    dismissItems(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/dismiss-items`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    updateDismissItem(id, actionId, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/dismiss-items/${actionId}`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    removeDismissItem(id, actionId, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/dismiss-items/${actionId}`, {
                method: "DELETE",
                headers,
                query,
            });
        });
    }
    confirmReceive(id, body, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/receive/confirm`, {
                method: "POST",
                headers,
                body,
                query,
            });
        });
    }
    cancelReceive(id, query, headers) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.fetch(`/admin/returns/${id}/receive`, {
                method: "DELETE",
                headers,
                query,
            });
        });
    }
}
//# sourceMappingURL=return.js.map