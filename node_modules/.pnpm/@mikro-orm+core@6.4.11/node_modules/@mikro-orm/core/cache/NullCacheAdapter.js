"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullCacheAdapter = void 0;
class NullCacheAdapter {
    /**
     * @inheritDoc
     */
    get(name) {
        return null;
    }
    /**
     * @inheritDoc
     */
    set(name, data, origin) {
        // ignore
    }
    /**
     * @inheritDoc
     */
    remove(name) {
        // ignore
    }
    /**
     * @inheritDoc
     */
    clear() {
        // ignore
    }
}
exports.NullCacheAdapter = NullCacheAdapter;
