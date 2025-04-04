"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediumIntType = void 0;
const IntegerType_1 = require("./IntegerType");
class MediumIntType extends IntegerType_1.IntegerType {
    getColumnType(prop, platform) {
        return platform.getMediumIntTypeDeclarationSQL(prop);
    }
}
exports.MediumIntType = MediumIntType;
