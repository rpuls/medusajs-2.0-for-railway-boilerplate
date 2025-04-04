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
var _ComputedProperty_schema, _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputedProperty = void 0;
const IsComputedProperty = Symbol.for("isComputedProperty");
/**
 * Computed property marks a schema node as computed
 */
class ComputedProperty {
    static isComputedProperty(obj) {
        return !!obj?.[IsComputedProperty];
    }
    constructor(schema) {
        this[_a] = true;
        /**
         * The parent schema on which the computed property is
         * applied
         */
        _ComputedProperty_schema.set(this, void 0);
        __classPrivateFieldSet(this, _ComputedProperty_schema, schema, "f");
    }
    /**
     * Returns the serialized metadata
     */
    parse(fieldName) {
        const schema = __classPrivateFieldGet(this, _ComputedProperty_schema, "f").parse(fieldName);
        schema.computed = true;
        return schema;
    }
}
exports.ComputedProperty = ComputedProperty;
_ComputedProperty_schema = new WeakMap(), _a = IsComputedProperty;
//# sourceMappingURL=computed.js.map