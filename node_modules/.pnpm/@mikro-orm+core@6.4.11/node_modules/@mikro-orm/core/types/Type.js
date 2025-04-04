"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = void 0;
const node_util_1 = require("node:util");
class Type {
    static types = new Map();
    platform;
    meta;
    prop;
    /**
     * Converts a value from its JS representation to its database representation of this type.
     */
    convertToDatabaseValue(value, platform, context) {
        return value;
    }
    /**
     * Converts a value from its database representation to its JS representation of this type.
     */
    convertToJSValue(value, platform) {
        return value;
    }
    /**
     * How should the raw database values be compared? Used in `EntityComparator`.
     * Possible values: string | number | bigint | boolean | date | any | buffer | array
     */
    compareAsType() {
        return 'any';
    }
    get runtimeType() {
        const compareType = this.compareAsType();
        return compareType === 'any' ? 'string' : compareType;
    }
    get name() {
        return this.constructor.name;
    }
    /**
     * When a value is hydrated, we convert it back to the database value to ensure comparability,
     * as often the raw database response is not the same as the `convertToDatabaseValue` result.
     * This allows to disable the additional conversion in case you know it is not needed.
     */
    ensureComparable(meta, prop) {
        return true;
    }
    /**
     * Converts a value from its JS representation to its serialized JSON form of this type.
     * By default uses the runtime value.
     */
    toJSON(value, platform) {
        return value;
    }
    /**
     * Gets the SQL declaration snippet for a field of this type.
     */
    getColumnType(prop, platform) {
        return prop.columnTypes?.[0] ?? platform.getTextTypeDeclarationSQL(prop);
    }
    static getType(cls) {
        const key = cls.name;
        if (!Type.types.has(key)) {
            Type.types.set(key, new cls());
        }
        return Type.types.get(key);
    }
    /**
     * Checks whether the argument is instance of `Type`.
     */
    static isMappedType(data) {
        return !!data?.__mappedType;
    }
    /** @ignore */
    [node_util_1.inspect.custom](depth = 2) {
        const object = { ...this };
        const hidden = ['prop', 'platform', 'meta'];
        hidden.forEach(k => delete object[k]);
        const ret = (0, node_util_1.inspect)(object, { depth });
        const name = this.constructor.name;
        /* istanbul ignore next */
        return ret === '[Object]' ? `[${name}]` : name + ' ' + ret;
    }
}
exports.Type = Type;
Object.defineProperties(Type.prototype, {
    __mappedType: { value: true, enumerable: false, writable: false },
});
