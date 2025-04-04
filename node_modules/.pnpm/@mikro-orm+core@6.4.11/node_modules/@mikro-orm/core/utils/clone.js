"use strict";
/**
 * Inspired by https://github.com/pvorb/clone but simplified and never tries to
 * clone `EventEmitter`s to get around https://github.com/mikro-orm/mikro-orm/issues/2748
 * @internal
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clone = clone;
const node_events_1 = require("node:events");
const RawQueryFragment_1 = require("./RawQueryFragment");
/**
 * Get the property descriptor of a property on an object or its prototype chain.
 *
 * @param obj - The object to get the property descriptor from.
 * @param prop - The property to get the descriptor for.
 */
function getPropertyDescriptor(obj, prop) {
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    if (descriptor) {
        return descriptor;
    }
    const proto = Object.getPrototypeOf(obj);
    if (proto) {
        return getPropertyDescriptor(proto, prop);
    }
    return null;
}
function clone(parent, respectCustomCloneMethod = true) {
    const allParents = [];
    const allChildren = [];
    function _clone(parent) {
        // cloning null always returns null
        if (parent === null) {
            return null;
        }
        const raw = RawQueryFragment_1.RawQueryFragment.getKnownFragment(parent, false);
        if (raw && respectCustomCloneMethod) {
            return raw.clone();
        }
        if (typeof parent !== 'object' || parent instanceof node_events_1.EventEmitter) {
            return parent;
        }
        if (respectCustomCloneMethod && 'clone' in parent && typeof parent.clone === 'function') {
            return parent.clone();
        }
        let child;
        let proto;
        if (parent instanceof Map) {
            child = new Map();
        }
        else if (parent instanceof Set) {
            child = new Set();
        }
        else if (parent instanceof Promise) {
            child = new Promise((resolve, reject) => {
                parent.then(resolve.bind(null, _clone), reject.bind(null, _clone));
            });
        }
        else if (Array.isArray(parent)) {
            child = [];
        }
        else if (parent instanceof RegExp) {
            let flags = '';
            if (parent.global) {
                flags += 'g';
            }
            if (parent.ignoreCase) {
                flags += 'i';
            }
            if (parent.multiline) {
                flags += 'm';
            }
            child = new RegExp(parent.source, flags);
            if (parent.lastIndex) {
                child.lastIndex = parent.lastIndex;
            }
        }
        else if (parent instanceof Date) {
            child = new Date(parent.getTime());
        }
        else if (Buffer.isBuffer(parent)) {
            child = Buffer.allocUnsafe(parent.length);
            parent.copy(child);
            return child;
        }
        else if (parent instanceof Error) {
            child = Object.create(parent);
        }
        else {
            proto = Object.getPrototypeOf(parent);
            child = Object.create(proto);
        }
        const index = allParents.indexOf(parent);
        if (index !== -1) {
            return allChildren[index];
        }
        allParents.push(parent);
        allChildren.push(child);
        if (parent instanceof Map) {
            parent.forEach((value, key) => {
                const keyChild = _clone(key);
                const valueChild = _clone(value);
                child.set(keyChild, valueChild);
            });
        }
        if (parent instanceof Set) {
            parent.forEach((value) => {
                const entryChild = _clone(value);
                child.add(entryChild);
            });
        }
        for (const i in parent) {
            let attrs;
            if (proto) {
                attrs = getPropertyDescriptor(proto, i);
            }
            if (attrs && typeof attrs.get === 'function' && attrs.set == null) {
                continue;
            }
            const raw = RawQueryFragment_1.RawQueryFragment.getKnownFragment(i, false);
            if (raw && respectCustomCloneMethod) {
                const i2 = raw.clone().toString();
                child[i2] = _clone(parent[i]);
                continue;
            }
            child[i] = _clone(parent[i]);
        }
        if (Object.getOwnPropertySymbols) {
            const symbols = Object.getOwnPropertySymbols(parent);
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
                /* istanbul ignore next */
                if (descriptor && !descriptor.enumerable) {
                    continue;
                }
                child[symbol] = _clone(parent[symbol]);
            }
        }
        return child;
    }
    return _clone(parent);
}
