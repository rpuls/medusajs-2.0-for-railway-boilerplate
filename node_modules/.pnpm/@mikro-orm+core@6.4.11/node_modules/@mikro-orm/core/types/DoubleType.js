"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoubleType = void 0;
const Type_1 = require("./Type");
/**
 * Type that maps an SQL DOUBLE to a JS string or number.
 */
class DoubleType extends Type_1.Type {
    convertToJSValue(value) {
        if (this.prop?.runtimeType === 'number') {
            return +value;
        }
        return value;
    }
    getColumnType(prop, platform) {
        return platform.getDoubleDeclarationSQL();
    }
    compareAsType() {
        return this.prop?.runtimeType ?? 'number';
    }
}
exports.DoubleType = DoubleType;
