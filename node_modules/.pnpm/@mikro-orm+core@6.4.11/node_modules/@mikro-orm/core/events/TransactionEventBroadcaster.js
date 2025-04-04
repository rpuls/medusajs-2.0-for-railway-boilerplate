"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionEventBroadcaster = void 0;
class TransactionEventBroadcaster {
    em;
    uow;
    context;
    eventManager;
    constructor(em, uow, context) {
        this.em = em;
        this.uow = uow;
        this.context = context;
        this.eventManager = this.em.getEventManager();
    }
    async dispatchEvent(event, transaction) {
        await this.eventManager.dispatchEvent(event, { em: this.em, transaction, uow: this.uow });
    }
    isTopLevel() {
        return !!this.context?.topLevelTransaction;
    }
}
exports.TransactionEventBroadcaster = TransactionEventBroadcaster;
