"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimeType = void 0;
const Type_1 = require("./Type");
class DateTimeType extends Type_1.Type {
    getColumnType(prop, platform) {
        return platform.getDateTimeTypeDeclarationSQL({ length: prop.length });
    }
    compareAsType() {
        return 'Date';
    }
    get runtimeType() {
        return 'Date';
    }
    ensureComparable() {
        return false;
    }
    getDefaultLength(platform) {
        return platform.getDefaultDateTimeLength();
    }
}
exports.DateTimeType = DateTimeType;
