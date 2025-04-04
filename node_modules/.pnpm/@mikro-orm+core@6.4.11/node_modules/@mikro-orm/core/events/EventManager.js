"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventManager = void 0;
const utils_1 = require("../utils");
const enums_1 = require("../enums");
class EventManager {
    listeners = {};
    entities = new Map();
    cache = new Map();
    subscribers = [];
    constructor(subscribers) {
        subscribers.forEach(subscriber => this.registerSubscriber(subscriber));
    }
    registerSubscriber(subscriber) {
        this.subscribers.push(subscriber);
        this.entities.set(subscriber, this.getSubscribedEntities(subscriber));
        this.cache.clear();
        utils_1.Utils.keys(enums_1.EventType)
            .filter(event => event in subscriber)
            .forEach(event => {
            this.listeners[event] ??= [];
            this.listeners[event].push(subscriber);
        });
    }
    dispatchEvent(event, args, meta) {
        const listeners = [];
        const entity = args.entity;
        // execute lifecycle hooks first
        meta ??= entity?.__meta;
        const hooks = (meta?.hooks[event] || []);
        listeners.push(...hooks.map(hook => {
            const prototypeHook = meta?.prototype[hook];
            const handler = typeof hook === 'function' ? hook : entity[hook] ?? prototypeHook;
            return handler.bind(entity);
        }));
        for (const listener of this.listeners[event] || []) {
            const entities = this.entities.get(listener);
            if (entities.length === 0 || !entity || entities.includes(entity.constructor.name)) {
                listeners.push(listener[event].bind(listener));
            }
        }
        if (event === enums_1.EventType.onInit) {
            return listeners.forEach(listener => listener(args));
        }
        return utils_1.Utils.runSerial(listeners, listener => listener(args));
    }
    hasListeners(event, meta) {
        const cacheKey = meta._id + enums_1.EventTypeMap[event];
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const hasHooks = meta.hooks[event]?.length;
        if (hasHooks) {
            this.cache.set(cacheKey, true);
            return true;
        }
        for (const listener of this.listeners[event] ?? []) {
            const entities = this.entities.get(listener);
            if (entities.length === 0 || entities.includes(meta.className)) {
                this.cache.set(cacheKey, true);
                return true;
            }
        }
        this.cache.set(cacheKey, false);
        return false;
    }
    clone() {
        return new EventManager(this.subscribers);
    }
    getSubscribedEntities(listener) {
        if (!listener.getSubscribedEntities) {
            return [];
        }
        return listener.getSubscribedEntities().map(name => utils_1.Utils.className(name));
    }
}
exports.EventManager = EventManager;
