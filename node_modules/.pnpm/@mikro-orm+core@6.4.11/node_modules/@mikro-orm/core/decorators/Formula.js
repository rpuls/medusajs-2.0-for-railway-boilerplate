"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Formula = Formula;
const metadata_1 = require("../metadata");
const enums_1 = require("../enums");
const Utils_1 = require("../utils/Utils");
function Formula(formula, options = {}) {
    return function (target, propertyName) {
        const meta = metadata_1.MetadataStorage.getMetadataFromDecorator(target.constructor);
        meta.properties[propertyName] = {
            name: propertyName,
            kind: enums_1.ReferenceKind.SCALAR,
            formula,
            ...options,
        };
        return Utils_1.Utils.propertyDecoratorReturnValue();
    };
}
