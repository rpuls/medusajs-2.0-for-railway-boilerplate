"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnknownType = void 0;
const Type_1 = require("./Type");
class UnknownType extends Type_1.Type {
    getColumnType(prop, platform) {
        return prop.columnTypes?.[0] ?? platform.getVarcharTypeDeclarationSQL(prop);
    }
    get runtimeType() {
        return 'unknown';
    }
    compareAsType() {
        return 'unknown';
    }
    ensureComparable() {
        return false;
    }
}
exports.UnknownType = UnknownType;
