"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCacheAdapter = void 0;
class MemoryCacheAdapter {
    options;
    data = new Map();
    constructor(options) {
        this.options = options;
    }
    /**
     * @inheritDoc
     */
    get(name) {
        const data = this.data.get(name);
        if (data) {
            if (data.expiration < Date.now()) {
                this.data.delete(name);
            }
            else {
                return data.data;
            }
        }
        return undefined;
    }
    /**
     * @inheritDoc
     */
    set(name, data, origin, expiration) {
        this.data.set(name, { data, expiration: Date.now() + (expiration ?? this.options.expiration) });
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
exports.MemoryCacheAdapter = MemoryCacheAdapter;
