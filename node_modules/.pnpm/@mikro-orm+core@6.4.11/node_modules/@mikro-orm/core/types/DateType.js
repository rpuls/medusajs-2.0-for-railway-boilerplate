"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateType = void 0;
const Type_1 = require("./Type");
class DateType extends Type_1.Type {
    compareAsType() {
        return 'string';
    }
    ensureComparable() {
        return false;
    }
    convertToJSValue(value, platform) {
        return platform.convertDateToJSValue(value);
    }
    getColumnType(prop, platform) {
        return platform.getDateTypeDeclarationSQL(prop.length);
    }
    getDefaultLength(platform) {
        return 0;
    }
}
exports.DateType = DateType;
