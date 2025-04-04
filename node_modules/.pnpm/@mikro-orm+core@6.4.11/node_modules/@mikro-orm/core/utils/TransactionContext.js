"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionContext = void 0;
const node_async_hooks_1 = require("node:async_hooks");
class TransactionContext {
    em;
    static storage = new node_async_hooks_1.AsyncLocalStorage();
    id;
    constructor(em) {
        this.em = em;
        this.id = this.em._id;
    }
    /**
     * Creates new TransactionContext instance and runs the code inside its domain.
     */
    static create(em, next) {
        const context = new TransactionContext(em);
        return this.storage.run(context, next);
    }
    /**
     * Returns current TransactionContext (if available).
     */
    static currentTransactionContext() {
        return this.storage.getStore();
    }
    /**
     * Returns current EntityManager (if available).
     */
    static getEntityManager(name = /* istanbul ignore next */ 'default') {
        const context = TransactionContext.currentTransactionContext();
        return context?.em.name === name ? context.em : undefined;
    }
}
exports.TransactionContext = TransactionContext;
