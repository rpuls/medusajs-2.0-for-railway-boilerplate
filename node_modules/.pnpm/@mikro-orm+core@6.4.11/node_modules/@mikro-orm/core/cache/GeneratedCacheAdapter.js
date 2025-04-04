"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratedCacheAdapter = void 0;
class GeneratedCacheAdapter {
    options;
    data = new Map();
    constructor(options) {
        this.options = options;
        this.data = new Map(Object.entries(options.data));
    }
    /**
     * @inheritDoc
     */
    get(name) {
        const key = name.replace(/\.[jt]s$/, '');
        const data = this.data.get(key);
        return data;
    }
    /**
     * @inheritDoc
     */
    set(name, data, origin) {
        this.data.set(name, { data });
    }
    /**
     * @inheritDoc
     */
    remove(name) {
        this.data.delete(name);
    }
    /**
     * @inheritDoc
     */
    clear() {
        this.data.clear();
    }
}
exports.GeneratedCacheAdapter = GeneratedCacheAdapter;
