"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundReason = void 0;
class RefundReason {
    /**
     * @ignore
     */
    constructor(client) {
        this.client = client;
    }
    async list(query, headers) {
        return await this.client.fetch(`/admin/refund-reasons`, {
            query,
            headers,
        });
    }
}
exports.RefundReason = RefundReason;
//# sourceMappingURL=refund-reasons.js.map