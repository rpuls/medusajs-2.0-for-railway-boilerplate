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
var _RelationNullableModifier_relation, _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationNullableModifier = void 0;
const base_1 = require("./base");
const IsNullableModifier = Symbol.for("isNullableModifier");
/**
 * Nullable modifier marks a schema node as nullable
 */
class RelationNullableModifier {
    static isNullableModifier(modifier) {
        return !!modifier?.[IsNullableModifier];
    }
    constructor(relation) {
        this[_a] = true;
        this[_b] = true;
        /**
         * The parent schema on which the nullable modifier is
         * applied
         */
        _RelationNullableModifier_relation.set(this, void 0);
        __classPrivateFieldSet(this, _RelationNullableModifier_relation, relation, "f");
        this.type = relation.type;
    }
    /**
     * Returns the serialized metadata
     */
    parse(fieldName) {
        const relation = __classPrivateFieldGet(this, _RelationNullableModifier_relation, "f").parse(fieldName);
        relation.nullable = true;
        return relation;
    }
}
exports.RelationNullableModifier = RelationNullableModifier;
_RelationNullableModifier_relation = new WeakMap(), _a = IsNullableModifier, _b = base_1.IsRelationship;
//# sourceMappingURL=nullable.js.map