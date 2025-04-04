"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContext = void 0;
const node_async_hooks_1 = require("node:async_hooks");
/**
 * Uses `AsyncLocalStorage` to create async context that holds the current EM fork.
 */
class RequestContext {
    map;
    static storage = new node_async_hooks_1.AsyncLocalStorage();
    static counter = 1;
    id = RequestContext.counter++;
    constructor(map) {
        this.map = map;
    }
    /**
     * Returns default EntityManager.
     */
    get em() {
        return this.map.get('default');
    }
    /**
     * Creates new RequestContext instance and runs the code inside its domain.
     * If the handler is async, the return value needs to be awaited.
     * Uses `AsyncLocalStorage.run()`, suitable for regular express style middlewares with a `next` callback.
     */
    static create(em, next, options = {}) {
        const ctx = this.createContext(em, options);
        return this.storage.run(ctx, next);
    }
    /**
     * Creates new RequestContext instance and runs the code inside its domain.
     * If the handler is async, the return value needs to be awaited.
     * Uses `AsyncLocalStorage.enterWith()`, suitable for elysia style middlewares without a `next` callback.
     */
    static enter(em, options = {}) {
        const ctx = this.createContext(em, options);
        this.storage.enterWith(ctx);
    }
    /**
     * Returns current RequestContext (if available).
     */
    static currentRequestContext() {
        return this.storage.getStore();
    }
    /**
     * Returns current EntityManager (if available).
     */
    static getEntityManager(name = 'default') {
        const context = RequestContext.currentRequestContext();
        return context ? context.map.get(name) : undefined;
    }
    static createContext(em, options = {}) {
        const forks = new Map();
        if (Array.isArray(em)) {
            em.forEach(em => forks.set(em.name, em.fork({ useContext: true, ...options })));
        }
        else {
            forks.set(em.name, em.fork({ useContext: true, ...options }));
        }
        return new RequestContext(forks);
    }
}
exports.RequestContext = RequestContext;
