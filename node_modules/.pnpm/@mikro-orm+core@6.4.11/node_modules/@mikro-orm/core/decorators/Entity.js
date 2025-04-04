"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = Entity;
const metadata_1 = require("../metadata");
const utils_1 = require("../utils");
function Entity(options = {}) {
    return function (target) {
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target);
        utils_1.Utils.mergeConfig(meta, options);
        meta.class = target;
        if (!options.abstract || meta.discriminatorColumn) {
            meta.name = target.name;
        }
    };
}
