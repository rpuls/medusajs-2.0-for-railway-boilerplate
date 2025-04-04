"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Index = Index;
exports.Unique = Unique;
const metadata_1 = require("../metadata");
const Utils_1 = require("../utils/Utils");
function createDecorator(options, unique) {
    return function (target, propertyName) {
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(propertyName ? target.constructor : target);
        options.properties ??= propertyName;
        const key = unique ? 'uniques' : 'indexes';
        meta[key].push(options);
        if (!propertyName) {
            return target;
        }
        return Utils_1.Utils.propertyDecoratorReturnValue();
    };
}
function Index(options = {}) {
    return createDecorator(options, false);
}
function Unique(options = {}) {
    return createDecorator(options, true);
}
