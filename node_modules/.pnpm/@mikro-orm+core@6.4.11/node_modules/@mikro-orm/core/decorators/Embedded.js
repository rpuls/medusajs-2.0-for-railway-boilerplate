"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Embedded = Embedded;
const metadata_1 = require("../metadata");
const utils_1 = require("../utils");
const enums_1 = require("../enums");
function Embedded(type = {}, options = {}) {
    return function (target, propertyName) {
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        metadata_1.MetadataValidator.validateSingleDecorator(meta, propertyName, enums_1.ReferenceKind.EMBEDDED);
        options = type instanceof Function ? { entity: type, ...options } : { ...type, ...options };
        utils_1.Utils.defaultValue(options, 'prefix', true);
        meta.properties[propertyName] = {
            name: propertyName,
            kind: enums_1.ReferenceKind.EMBEDDED,
            ...options,
        };
        return utils_1.Utils.propertyDecoratorReturnValue();
    };
}
