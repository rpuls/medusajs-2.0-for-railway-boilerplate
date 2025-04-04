"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataProvider = void 0;
const Utils_1 = require("../utils/Utils");
class MetadataProvider {
    config;
    constructor(config) {
        this.config = config;
    }
    loadFromCache(meta, cache) {
        Object.values(cache.properties).forEach(prop => {
            const metaProp = meta.properties[prop.name];
            if (metaProp?.enum && Array.isArray(metaProp.items)) {
                delete prop.items;
            }
        });
        Utils_1.Utils.mergeConfig(meta, cache);
    }
    useCache() {
        return this.config.get('metadataCache').enabled ?? false;
    }
}
exports.MetadataProvider = MetadataProvider;
