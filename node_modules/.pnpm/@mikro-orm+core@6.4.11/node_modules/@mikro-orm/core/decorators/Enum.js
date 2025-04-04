"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enum = Enum;
const metadata_1 = require("../metadata");
const enums_1 = require("../enums");
const Utils_1 = require("../utils/Utils");
function Enum(options = {}) {
    return function (target, propertyName) {
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        options = options instanceof Function ? { items: options } : options;
        meta.properties[propertyName] = {
            name: propertyName,
            kind: enums_1.ReferenceKind.SCALAR,
            enum: true,
            ...options,
        };
        return Utils_1.Utils.propertyDecoratorReturnValue();
    };
}
