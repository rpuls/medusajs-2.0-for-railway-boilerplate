"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterType = void 0;
const StringType_1 = require("./StringType");
class CharacterType extends StringType_1.StringType {
    getColumnType(prop, platform) {
        return platform.getCharTypeDeclarationSQL(prop);
    }
    getDefaultLength(platform) {
        return platform.getDefaultCharLength();
    }
}
exports.CharacterType = CharacterType;
