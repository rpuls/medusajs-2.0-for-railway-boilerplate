"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumArrayType = void 0;
const node_util_1 = require("node:util");
const ArrayType_1 = require("./ArrayType");
const errors_1 = require("../errors");
function mapHydrator(items, hydrate) {
    if (items && items.length > 0 && typeof items[0] === 'number') {
        return (i) => +i;
    }
    return hydrate;
}
class EnumArrayType extends ArrayType_1.ArrayType {
    owner;
    items;
    constructor(owner, items, hydrate = i => i) {
        super(mapHydrator(items, hydrate));
        this.owner = owner;
        this.items = items;
    }
    convertToDatabaseValue(value, platform, context) {
        /* istanbul ignore else */
        if (Array.isArray(value) && Array.isArray(this.items)) {
            const invalid = value.filter(v => !this.items.includes(v));
            if (invalid.length > 0) {
                throw new errors_1.ValidationError(`Invalid enum array items provided in ${this.owner}: ${(0, node_util_1.inspect)(invalid)}`);
            }
        }
        return super.convertToDatabaseValue(value, platform, context);
    }
    getColumnType(prop, platform) {
        if (prop.nativeEnumName) {
            return `${prop.nativeEnumName}[]`;
        }
        return super.getColumnType(prop, platform);
    }
}
exports.EnumArrayType = EnumArrayType;
