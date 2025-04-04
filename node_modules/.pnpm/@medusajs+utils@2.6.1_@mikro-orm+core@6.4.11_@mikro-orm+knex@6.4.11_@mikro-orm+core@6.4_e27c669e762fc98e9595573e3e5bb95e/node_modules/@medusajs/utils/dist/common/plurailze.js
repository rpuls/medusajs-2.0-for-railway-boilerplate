"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluralize = pluralize;
const pluralize_1 = __importDefault(require("pluralize"));
pluralize_1.default.addUncountableRule("info");
/**
 * Function to pluralize English words.
 * @param word
 */
function pluralize(word) {
    // TODO: Implement language specific pluralize function
    return (0, pluralize_1.default)(word);
}
//# sourceMappingURL=plurailze.js.map