"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecimalType = void 0;
const Type_1 = require("./Type");
/**
 * Type that maps an SQL DECIMAL to a JS string or number.
 */
class DecimalType extends Type_1.Type {
    mode;
    constructor(mode) {
        super();
        this.mode = mode;
    }
    convertToJSValue(value) {
        if ((this.mode ?? this.prop?.runtimeType) === 'number') {
            return +value;
        }
        return value;
    }
    compareValues(a, b) {
        return this.format(a) === this.format(b);
    }
    format(val) {
        /* istanbul ignore next */
        if (this.prop?.scale == null) {
            return +val;
        }
        const base = Math.pow(10, this.prop.scale);
        return Math.round((+val + Number.EPSILON) * base) / base;
    }
    getColumnType(prop, platform) {
        return platform.getDecimalTypeDeclarationSQL(prop);
    }
    compareAsType() {
        return this.mode ?? this.prop?.runtimeType ?? 'string';
    }
}
exports.DecimalType = DecimalType;
