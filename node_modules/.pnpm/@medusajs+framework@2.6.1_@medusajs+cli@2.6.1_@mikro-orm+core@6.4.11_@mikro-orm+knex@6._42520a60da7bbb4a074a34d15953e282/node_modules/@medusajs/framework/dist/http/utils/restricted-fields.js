"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RestrictedFields_restrictedFields;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestrictedFields = void 0;
class RestrictedFields {
    constructor() {
        /**
         * Fields that are restricted from being selected in the response.
         * Those fields can be allowed if specified in the allowed configuration of the query config of an end point.
         *
         * @type {string[]}
         * @private
         */
        _RestrictedFields_restrictedFields.set(this, new Set());
    }
    list() {
        return Array.from(__classPrivateFieldGet(this, _RestrictedFields_restrictedFields, "f"));
    }
    add(fields) {
        fields.map((field) => __classPrivateFieldGet(this, _RestrictedFields_restrictedFields, "f").add(field));
    }
}
exports.RestrictedFields = RestrictedFields;
_RestrictedFields_restrictedFields = new WeakMap();
//# sourceMappingURL=restricted-fields.js.map