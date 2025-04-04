"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumType = void 0;
const Type_1 = require("./Type");
class EnumType extends Type_1.Type {
    getColumnType(prop, platform) {
        if (prop.nativeEnumName) {
            return prop.nativeEnumName;
        }
        return prop.columnTypes?.[0] ?? platform.getEnumTypeDeclarationSQL(prop);
    }
    compareAsType() {
        return 'string';
    }
    ensureComparable() {
        return false;
    }
}
exports.EnumType = EnumType;
