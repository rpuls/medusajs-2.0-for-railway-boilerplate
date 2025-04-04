"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BigIntType = void 0;
const Type_1 = require("./Type");
/**
 * This type will automatically convert string values returned from the database to native JS bigints (default)
 * or numbers (safe only for values up to `Number.MAX_SAFE_INTEGER`), or strings, depending on the `mode`.
 */
class BigIntType extends Type_1.Type {
    mode;
    constructor(mode) {
        super();
        this.mode = mode;
    }
    convertToDatabaseValue(value) {
        if (value == null) {
            return value;
        }
        return '' + value;
    }
    convertToJSValue(value) {
        if (value == null) {
            return value;
        }
        switch (this.mode) {
            case 'number':
                return Number(value);
            case 'string':
                return String(value);
            case 'bigint':
            default:
                return BigInt(String(value));
        }
    }
    toJSON(value) {
        if (this.mode === 'number') {
            return value;
        }
        return this.convertToDatabaseValue(value);
    }
    getColumnType(prop, platform) {
        return platform.getBigIntTypeDeclarationSQL(prop);
    }
    compareAsType() {
        return this.mode ?? 'bigint';
    }
    compareValues(a, b) {
        return String(a) === String(b);
    }
}
exports.BigIntType = BigIntType;
