"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitySerializer = void 0;
exports.serialize = serialize;
const wrap_1 = require("../entity/wrap");
const Utils_1 = require("../utils/Utils");
const enums_1 = require("../enums");
const Reference_1 = require("../entity/Reference");
const SerializationContext_1 = require("./SerializationContext");
function isVisible(meta, propName, options) {
    const prop = meta.properties[propName];
    if (options.groups && prop?.groups) {
        return prop.groups.some(g => options.groups.includes(g));
    }
    if (Array.isArray(options.populate) && options.populate?.find(item => item === propName || item.startsWith(propName + '.') || item === '*')) {
        return true;
    }
    if (options.exclude?.find(item => item === propName)) {
        return false;
    }
    const visible = prop && !prop.hidden;
    const prefixed = prop && !prop.primary && propName.startsWith('_'); // ignore prefixed properties, if it's not a PK
    return visible && !prefixed;
}
function isPopulated(propName, options) {
    if (typeof options.populate !== 'boolean' && options.populate?.find(item => item === propName || item.startsWith(propName + '.') || item === '*')) {
        return true;
    }
    if (typeof options.populate === 'boolean') {
        return options.populate;
    }
    return false;
}
class EntitySerializer {
    static serialize(entity, options = {}) {
        const wrapped = (0, wrap_1.helper)(entity);
        const meta = wrapped.__meta;
        let contextCreated = false;
        if (!wrapped.__serializationContext.root) {
            const root = new SerializationContext_1.SerializationContext(wrapped.__config);
            SerializationContext_1.SerializationContext.propagate(root, entity, (meta, prop) => meta.properties[prop]?.kind !== enums_1.ReferenceKind.SCALAR);
            options.populate = (options.populate ? Utils_1.Utils.asArray(options.populate) : options.populate);
            contextCreated = true;
        }
        const root = wrapped.__serializationContext.root;
        const ret = {};
        const keys = new Set(meta.primaryKeys);
        Utils_1.Utils.keys(entity).forEach(prop => keys.add(prop));
        const visited = root.visited.has(entity);
        if (!visited) {
            root.visited.add(entity);
        }
        for (const prop of keys) {
            if (!isVisible(meta, prop, options)) {
                continue;
            }
            const cycle = root.visit(meta.className, prop);
            if (cycle && visited) {
                continue;
            }
            const val = this.processProperty(prop, entity, options);
            if (!cycle) {
                root.leave(meta.className, prop);
            }
            if (options.skipNull && Utils_1.Utils.isPlainObject(val)) {
                Utils_1.Utils.dropUndefinedProperties(val, null);
            }
            if (Utils_1.Utils.isRawSql(val)) {
                throw new Error(`Trying to serialize raw SQL fragment: '${val.sql}'`);
            }
            const visible = typeof val !== 'undefined' && !(val === null && options.skipNull);
            if (visible) {
                ret[this.propertyName(meta, prop, wrapped.__platform)] = val;
            }
        }
        if (contextCreated) {
            root.close();
        }
        if (!wrapped.isInitialized()) {
            return ret;
        }
        for (const prop of meta.getterProps) {
            // decorated get methods
            if (prop.getterName != null) {
                const visible = entity[prop.getterName] instanceof Function && isVisible(meta, prop.name, options);
                if (visible) {
                    ret[this.propertyName(meta, prop.name, wrapped.__platform)] = this.processProperty(prop.getterName, entity, options);
                }
            }
            else {
                // decorated getters
                const visible = typeof entity[prop.name] !== 'undefined' && isVisible(meta, prop.name, options);
                if (visible) {
                    ret[this.propertyName(meta, prop.name, wrapped.__platform)] = this.processProperty(prop.name, entity, options);
                }
            }
        }
        return ret;
    }
    static propertyName(meta, prop, platform) {
        /* istanbul ignore next */
        if (meta.properties[prop]?.serializedName) {
            return meta.properties[prop].serializedName;
        }
        if (meta.properties[prop]?.primary && platform) {
            return platform.getSerializedPrimaryKeyField(prop);
        }
        return prop;
    }
    static processProperty(prop, entity, options) {
        const parts = prop.split('.');
        prop = parts[0];
        const wrapped = (0, wrap_1.helper)(entity);
        const property = wrapped.__meta.properties[prop] ?? { name: prop };
        const serializer = property?.serializer;
        const value = entity[prop];
        // getter method
        if (entity[prop] instanceof Function) {
            const returnValue = entity[prop]();
            if (!options.ignoreSerializers && serializer) {
                return serializer(returnValue, this.extractChildOptions(options, prop));
            }
            return returnValue;
        }
        /* istanbul ignore next */
        if (!options.ignoreSerializers && serializer) {
            return serializer(value);
        }
        if (Utils_1.Utils.isCollection(value)) {
            return this.processCollection(property, entity, options);
        }
        if (Utils_1.Utils.isEntity(value, true)) {
            return this.processEntity(property, entity, wrapped.__platform, options);
        }
        if (Utils_1.Utils.isScalarReference(value)) {
            return value.unwrap();
        }
        /* istanbul ignore next */
        if (property?.kind === enums_1.ReferenceKind.EMBEDDED) {
            if (Array.isArray(value)) {
                return value.map(item => (0, wrap_1.helper)(item).toJSON());
            }
            if (Utils_1.Utils.isObject(value)) {
                return (0, wrap_1.helper)(value).toJSON();
            }
        }
        const customType = property?.customType;
        if (customType) {
            return customType.toJSON(value, wrapped.__platform);
        }
        return wrapped.__platform.normalizePrimaryKey(value);
    }
    static extractChildOptions(options, prop) {
        return {
            ...options,
            populate: Array.isArray(options.populate) ? Utils_1.Utils.extractChildElements(options.populate, prop, '*') : options.populate,
            exclude: Array.isArray(options.exclude) ? Utils_1.Utils.extractChildElements(options.exclude, prop) : options.exclude,
        };
    }
    static processEntity(prop, entity, platform, options) {
        const child = Reference_1.Reference.unwrapReference(entity[prop.name]);
        const wrapped = (0, wrap_1.helper)(child);
        const populated = isPopulated(prop.name, options) && wrapped.isInitialized();
        const expand = populated || !wrapped.__managed;
        const meta = wrapped.__meta;
        const childOptions = this.extractChildOptions(options, prop.name);
        const visible = meta.primaryKeys.filter(prop => isVisible(meta, prop, childOptions));
        if (expand) {
            return this.serialize(child, childOptions);
        }
        let pk = wrapped.getPrimaryKey();
        if (prop.customType) {
            pk = prop.customType.toJSON(pk, wrapped.__platform);
        }
        if (options.forceObject || wrapped.__config.get('serialization').forceObject) {
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
    static processCollection(prop, entity, options) {
        const col = entity[prop.name];
        if (!col.isInitialized()) {
            return undefined;
        }
        return col.getItems(false).map(item => {
            const populated = isPopulated(prop.name, options);
            const wrapped = (0, wrap_1.helper)(item);
            if (populated || !wrapped.__managed) {
                return this.serialize(item, this.extractChildOptions(options, prop.name));
            }
            let pk = wrapped.getPrimaryKey();
            if (prop.customType) {
                pk = prop.customType.toJSON(pk, wrapped.__platform);
            }
            if (options.forceObject || wrapped.__config.get('serialization').forceObject) {
                return Utils_1.Utils.primaryKeyToObject(wrapped.__meta, pk);
            }
            return pk;
        });
    }
}
exports.EntitySerializer = EntitySerializer;
/**
 * Converts entity instance to POJO, converting the `Collection`s to arrays and unwrapping the `Reference` wrapper, while respecting the serialization options.
 * This method accepts either a single entity or an array of entities, and returns the corresponding POJO or an array of POJO.
 * To serialize a single entity, you can also use `wrap(entity).serialize()` which handles a single entity only.
 *
 * ```ts
 * const dtos = serialize([user1, user, ...], { exclude: ['id', 'email'], forceObject: true });
 * const [dto2, dto3] = serialize([user2, user3], { exclude: ['id', 'email'], forceObject: true });
 * const dto1 = serialize(user, { exclude: ['id', 'email'], forceObject: true });
 * const dto2 = wrap(user).serialize({ exclude: ['id', 'email'], forceObject: true });
 * ```
 */
function serialize(entities, options) {
    if (Array.isArray(entities)) {
        return entities.map(e => EntitySerializer.serialize(e, options));
    }
    return EntitySerializer.serialize(entities, options);
}
