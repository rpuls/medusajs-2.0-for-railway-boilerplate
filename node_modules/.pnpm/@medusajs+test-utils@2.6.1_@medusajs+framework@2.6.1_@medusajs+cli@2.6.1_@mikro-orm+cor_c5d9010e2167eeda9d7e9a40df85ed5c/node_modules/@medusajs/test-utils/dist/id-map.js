"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const randomatic_1 = __importDefault(require("randomatic"));
class IdMap {
    constructor() {
        this.ids = {};
    }
    getId(key, prefix = "", length = 10) {
        if (this.ids[key]) {
            return this.ids[key];
        }
        const id = `${prefix && prefix + "_"}${(0, randomatic_1.default)("Aa0", length)}`;
        this.ids[key] = id;
        return id;
    }
}
const instance = new IdMap();
exports.default = instance;
//# sourceMappingURL=id-map.js.map