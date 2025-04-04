"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReflectMetadataProvider = void 0;
require("reflect-metadata");
const MetadataProvider_1 = require("./MetadataProvider");
const enums_1 = require("../enums");
const Utils_1 = require("../utils/Utils");
class ReflectMetadataProvider extends MetadataProvider_1.MetadataProvider {
    loadEntityMetadata(meta, name) {
        this.initProperties(meta);
    }
    initProperties(meta) {
        // load types and column names
        for (const prop of meta.props) {
            if (typeof prop.entity === 'string') {
                prop.type = prop.entity;
            }
            else if (prop.entity) {
                const tmp = prop.entity();
                prop.type = Array.isArray(tmp) ? tmp.map(t => Utils_1.Utils.className(t)).sort().join(' | ') : Utils_1.Utils.className(tmp);
            }
            else {
                this.initPropertyType(meta, prop);
            }
        }
    }
    initPropertyType(meta, prop) {
        const type = Reflect.getMetadata('design:type', meta.prototype, prop.name);
        if (!prop.type && (!type || (type === Object && prop.kind !== enums_1.ReferenceKind.SCALAR)) && !(prop.enum && (prop.items?.length ?? 0) > 0)) {
            throw new Error(`Please provide either 'type' or 'entity' attribute in ${meta.className}.${prop.name}. If you are using decorators, ensure you have 'emitDecoratorMetadata' enabled in your tsconfig.json.`);
        }
        // Force mapping to UnknownType which is a string when we see just `Object`, as that often means failed inference.
        // This is to prevent defaulting to JSON column type, which can often be hard to revert and cause hard to understand issues with PKs.
        // If there are explicitly provided `columnTypes`, we use those instead for the inference, this way
        // we can have things like `columnType: 'timestamp'` be respected as `type: 'Date'`.
        if (prop.kind === enums_1.ReferenceKind.SCALAR && type === Object && !prop.columnTypes) {
            prop.type ??= 'any';
            return;
        }
        let typeName = type?.name;
        if (typeName && ['string', 'number', 'boolean', 'array', 'object'].includes(typeName.toLowerCase())) {
            typeName = typeName.toLowerCase();
        }
        prop.type ??= typeName;
        prop.runtimeType ??= typeName;
    }
}
exports.ReflectMetadataProvider = ReflectMetadataProvider;
