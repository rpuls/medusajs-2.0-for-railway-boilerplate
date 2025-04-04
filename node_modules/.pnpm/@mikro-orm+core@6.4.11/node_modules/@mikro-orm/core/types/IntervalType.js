"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervalType = void 0;
const Type_1 = require("./Type");
class IntervalType extends Type_1.Type {
    getColumnType(prop, platform) {
        return platform.getIntervalTypeDeclarationSQL(prop);
    }
    convertToJSValue(value, platform) {
        return platform.convertIntervalToJSValue(value);
    }
    convertToDatabaseValue(value, platform) {
        return platform.convertIntervalToDatabaseValue(value);
    }
    getDefaultLength(platform) {
        return platform.getDefaultDateTimeLength();
    }
}
exports.IntervalType = IntervalType;
