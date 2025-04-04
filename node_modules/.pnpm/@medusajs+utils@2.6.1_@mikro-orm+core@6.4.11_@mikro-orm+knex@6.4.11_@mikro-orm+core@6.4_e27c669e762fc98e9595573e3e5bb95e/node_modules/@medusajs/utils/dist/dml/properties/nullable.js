"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _NullableModifier_schema, _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NullableModifier = void 0;
const computed_1 = require("./computed");
const IsNullableModifier = Symbol.for("isNullableModifier");
/**
 * Nullable modifier marks a schema node as nullable
 */
class NullableModifier {
    static isNullableModifier(obj) {
        return !!obj?.[IsNullableModifier];
    }
    constructor(schema) {
        this[_a] = true;
        /**
         * The parent schema on which the nullable modifier is
         * applied
         */
        _NullableModifier_schema.set(this, void 0);
        __classPrivateFieldSet(this, _NullableModifier_schema, schema, "f");
    }
    /**
     * This method indicated that the property is a computed property.
     */
    computed() {
        return new computed_1.ComputedProperty(this);
    }
    /**
     * Returns the serialized metadata
     */
    parse(fieldName) {
        const schema = __classPrivateFieldGet(this, _NullableModifier_schema, "f").parse(fieldName);
        schema.nullable = true;
        return schema;
    }
}
exports.NullableModifier = NullableModifier;
_NullableModifier_schema = new WeakMap(), _a = IsNullableModifier;
//# sourceMappingURL=nullable.js.map