"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityTransformer = void 0;
const wrap_1 = require("../entity/wrap");
const Utils_1 = require("../utils/Utils");
const enums_1 = require("../enums");
const SerializationContext_1 = require("./SerializationContext");
function isVisible(meta, propName, ignoreFields = []) {
    const prop = meta.properties[propName];
    const visible = prop && !prop.hidden;
    const prefixed = prop && !prop.primary && propName.startsWith('_'); // ignore prefixed properties, if it's not a PK
    return visible && !prefixed && !ignoreFields.includes(propName);
}
class EntityTransformer {
    static toObject(entity, ignoreFields = [], raw = false) {
        if (!Array.isArray(ignoreFields)) {
            ignoreFields = [];
        }
        const wrapped = (0, wrap_1.helper)(entity);
        let contextCreated = false;
        if (!wrapped) {
            return entity;
        }
        if (!wrapped.__serializationContext.root) {
            const root = new SerializationContext_1.SerializationContext(wrapped.__config, wrapped.__serializationContext.populate, wrapped.__serializationContext.fields, wrapped.__serializationContext.exclude);
            SerializationContext_1.SerializationContext.propagate(root, entity, isVisible);
            contextCreated = true;
        }
        const root = wrapped.__serializationContext.root;
        const meta = wrapped.__meta;
        const ret = {};
        const keys = new Set();
        if (meta.serializedPrimaryKey && !meta.compositePK) {
            keys.add(meta.serializedPrimaryKey);
        }
        else {
            meta.primaryKeys.forEach(pk => keys.add(pk));
        }
        if (wrapped.isInitialized() || !wrapped.hasPrimaryKey()) {
            Utils_1.Utils.keys(entity).forEach(prop => keys.add(prop));
        }
        const visited = root.visited.has(entity);
        const includePrimaryKeys = wrapped.__config.get('serialization').includePrimaryKeys;
        if (!visited) {
            root.visited.add(entity);
        }
        for (const prop of keys) {
            const visible = raw ? meta.properties[prop] : isVisible(meta, prop, ignoreFields);
            if (!visible) {
                continue;
            }
            const populated = root.isMarkedAsPopulated(meta.className, prop);
            const partiallyLoaded = root.isPartiallyLoaded(meta.className, prop);
            const isPrimary = includePrimaryKeys && meta.properties[prop].primary;
            if (!partiallyLoaded && !populated && !isPrimary) {
                continue;
            }
            const cycle = root.visit(meta.className, prop);
            if (cycle && visited) {
                continue;
            }
            const val = EntityTransformer.processProperty(prop, entity, raw, populated);
            if (!cycle) {
                root.leave(meta.className, prop);
            }
            if (Utils_1.Utils.isRawSql(val)) {
                throw new Error(`Trying to serialize raw SQL fragment: '${val.sql}'`);
            }
            if (typeof val === 'undefined') {
                continue;
            }
            ret[this.propertyName(meta, prop, wrapped.__platform, raw)] = val;
        }
        if (!wrapped.isInitialized() && wrapped.hasPrimaryKey()) {
            return ret;
        }
        for (const prop of meta.getterProps) {
            // decorated get methods
            if (prop.getterName != null) {
                const visible = !prop.hidden && entity[prop.getterName] instanceof Function;
                const populated = root.isMarkedAsPopulated(meta.className, prop.name);
                if (visible) {
                    ret[this.propertyName(meta, prop.name, wrapped.__platform, raw)] = this.processProperty(prop.getterName, entity, raw, populated);
                }
            }
            else {
                // decorated getters
                const visible = !prop.hidden && typeof entity[prop.name] !== 'undefined';
                const populated = root.isMarkedAsPopulated(meta.className, prop.name);
                if (visible) {
                    ret[this.propertyName(meta, prop.name, wrapped.__platform, raw)] = this.processProperty(prop.name, entity, raw, populated);
                }
            }
        }
        if (contextCreated) {
            root.close();
        }
        return ret;
    }
    static propertyName(meta, prop, platform, raw) {
        if (raw) {
            return prop;
        }
        if (meta.properties[prop].serializedName) {
            return meta.properties[prop].serializedName;
        }
        if (meta.properties[prop].primary && platform) {
            return platform.getSerializedPrimaryKeyField(prop);
        }
        return prop;
    }
    static processProperty(prop, entity, raw, populated) {
        const wrapped = (0, wrap_1.helper)(entity);
        const property = wrapped.__meta.properties[prop] ?? { name: prop };
        const serializer = property?.serializer;
        const value = entity[prop];
        // getter method
        if (entity[prop] instanceof Function) {
            const returnValue = entity[prop]();
            if (serializer && !raw) {
                return serializer(returnValue);
            }
            return returnValue;
        }
        if (serializer && !raw) {
            return serializer(value);
        }
        if (Utils_1.Utils.isCollection(value)) {
            return EntityTransformer.processCollection(property, entity, raw, populated);
        }
        if (Utils_1.Utils.isEntity(value, true)) {
            return EntityTransformer.processEntity(property, entity, wrapped.__platform, raw, populated);
        }
        if (Utils_1.Utils.isScalarReference(value)) {
            return value.unwrap();
        }
        if (property.kind === enums_1.ReferenceKind.EMBEDDED) {
            if (Array.isArray(value)) {
                return value.map(item => {
                    const wrapped = item && (0, wrap_1.helper)(item);
                    return wrapped ? wrapped.toJSON() : item;
                });
            }
            const wrapped = value && (0, wrap_1.helper)(value);
            return wrapped ? wrapped.toJSON() : value;
        }
        const customType = property?.customType;
        if (customType) {
            return customType.toJSON(value, wrapped.__platform);
        }
        if (property?.primary) {
            return wrapped.__platform.normalizePrimaryKey(value);
        }
        return value;
    }
    static processEntity(prop, entity, platform, raw, populated) {
        const child = entity[prop.name];
        const wrapped = (0, wrap_1.helper)(child);
        const meta = wrapped.__meta;
        const visible = meta.primaryKeys.filter(prop => isVisible(meta, prop));
        if (raw && wrapped.isInitialized() && child !== entity) {
            return wrapped.toPOJO();
        }
        function isPopulated() {
            if (wrapped.__populated != null) {
                return wrapped.__populated;
            }
            if (populated) {
                return true;
            }
            return !wrapped.__managed;
        }
        if (wrapped.isInitialized() && isPopulated() && child !== entity) {
            return (0, wrap_1.wrap)(child).toJSON();
        }
        let pk = wrapped.getPrimaryKey();
        if (prop.customType) {
            pk = prop.customType.toJSON(pk, wrapped.__platform);
        }
        if (wrapped.__config.get('serialization').forceObject) {
            return Utils_1.Utils.primaryKeyToObject(meta, pk, visible);
        }
        if (Utils_1.Utils.isPlainObject(pk)) {
            const pruned = Utils_1.Utils.primaryKeyToObject(meta, pk, visible);
            if (visible.length === 1) {
                return platform.normalizePrimaryKey(pruned[visible[0]]);
            }
            return pruned;
        }
        return platform.normalizePrimaryKey(pk);
    }
    static processCollection(prop, entity, raw, populated) {
        const col = entity[prop.name];
        if (raw && col.isInitialized(true)) {
            return col.map(item => (0, wrap_1.helper)(item).toPOJO());
        }
        if (col.shouldPopulate(populated)) {
            return col.toArray();
        }
        if (col.isInitialized()) {
            const wrapped = (0, wrap_1.helper)(entity);
            const forceObject = wrapped.__config.get('serialization').forceObject;
            return col.map(item => {
                const wrapped = (0, wrap_1.helper)(item);
                const pk = wrapped.getPrimaryKey();
                if (prop.customType) {
                    return prop.customType.toJSON(pk, wrapped.__platform);
                }
                if (forceObject) {
                    return Utils_1.Utils.primaryKeyToObject(wrapped.__meta, pk);
                }
                return pk;
            });
        }
        return undefined;
    }
}
exports.EntityTransformer = EntityTransformer;
