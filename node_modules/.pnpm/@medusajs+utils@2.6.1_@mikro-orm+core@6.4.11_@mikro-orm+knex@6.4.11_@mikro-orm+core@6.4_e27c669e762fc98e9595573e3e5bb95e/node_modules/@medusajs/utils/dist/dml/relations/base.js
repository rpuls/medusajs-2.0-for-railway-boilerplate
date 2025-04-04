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
var _BaseRelationship_searchable, _BaseRelationship_referencedEntity, _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRelationship = exports.IsRelationship = void 0;
exports.IsRelationship = Symbol.for("isRelationship");
/**
 * The BaseRelationship encapsulates the repetitive parts of defining
 * a relationship
 */
class BaseRelationship {
    static isRelationship(relationship) {
        return !!relationship?.[exports.IsRelationship];
    }
    constructor(referencedEntity, options) {
        this[_a] = true;
        _BaseRelationship_searchable.set(this, false);
        _BaseRelationship_referencedEntity.set(this, void 0);
        __classPrivateFieldSet(this, _BaseRelationship_referencedEntity, referencedEntity, "f");
        this.options = options;
    }
    /**
     * This method indicates that the relationship is searchable
     *
     * @example
     * import { model } from "@medusajs/framework/utils"
     *
     * const Product = model.define("Product", {
     *   variants: model.hasMany(() => ProductVariant).searchable(),
     *   // ...
     * })
     *
     * export default Product
     */
    searchable() {
        __classPrivateFieldSet(this, _BaseRelationship_searchable, true, "f");
        return this;
    }
    /**
     * Returns the parsed copy of the relationship
     */
    parse(relationshipName) {
        return {
            name: relationshipName,
            nullable: false,
            ...("mappedBy" in this.options
                ? { mappedBy: this.options.mappedBy }
                : {}),
            options: this.options,
            searchable: __classPrivateFieldGet(this, _BaseRelationship_searchable, "f"),
            entity: __classPrivateFieldGet(this, _BaseRelationship_referencedEntity, "f"),
            type: this.type,
        };
    }
}
exports.BaseRelationship = BaseRelationship;
_BaseRelationship_searchable = new WeakMap(), _BaseRelationship_referencedEntity = new WeakMap(), _a = exports.IsRelationship;
//# sourceMappingURL=base.js.map