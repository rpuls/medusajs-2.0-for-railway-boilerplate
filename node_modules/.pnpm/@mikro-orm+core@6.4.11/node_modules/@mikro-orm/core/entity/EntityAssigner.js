"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assign = exports.EntityAssigner = void 0;
const node_util_1 = require("node:util");
const Collection_1 = require("./Collection");
const Utils_1 = require("../utils/Utils");
const Reference_1 = require("./Reference");
const enums_1 = require("../enums");
const EntityValidator_1 = require("./EntityValidator");
const wrap_1 = require("./wrap");
const EntityHelper_1 = require("./EntityHelper");
const validator = new EntityValidator_1.EntityValidator(false);
class EntityAssigner {
    static assign(entity, data, options = {}) {
        let opts = options;
        if (opts.visited?.has(entity)) {
            return entity;
        }
        EntityHelper_1.EntityHelper.ensurePropagation(entity);
        opts.visited ??= new Set();
        opts.visited.add(entity);
        const wrapped = (0, wrap_1.helper)(entity);
        opts = {
            ...wrapped.__config.get('assign'),
            schema: wrapped.__schema,
            ...opts, // allow overriding the defaults
        };
        const meta = wrapped.__meta;
        const props = meta.properties;
        Object.keys(data).forEach(prop => {
            return EntityAssigner.assignProperty(entity, prop, props, data, {
                ...opts,
                em: opts.em || wrapped.__em,
                platform: wrapped.__platform,
            });
        });
        return entity;
    }
    static assignProperty(entity, propName, props, data, options) {
        let value = data[propName];
        const onlyProperties = options.onlyProperties && !(propName in props);
        const ignoreUndefined = options.ignoreUndefined === true && value === undefined;
        if (onlyProperties || ignoreUndefined) {
            return;
        }
        const prop = { ...props[propName], name: propName };
        if (prop && options.onlyOwnProperties) {
            if ([enums_1.ReferenceKind.MANY_TO_MANY, enums_1.ReferenceKind.ONE_TO_MANY].includes(prop.kind)) {
                return;
            }
            if ([enums_1.ReferenceKind.MANY_TO_ONE, enums_1.ReferenceKind.ONE_TO_ONE].includes(prop.kind)) {
                value = Utils_1.Utils.extractPK(value, prop.targetMeta);
            }
        }
        if (propName in props && !prop.nullable && value == null) {
            throw new Error(`You must pass a non-${value} value to the property ${propName} of entity ${entity.constructor.name}.`);
        }
        // create collection instance if its missing so old items can be deleted with orphan removal
        if ([enums_1.ReferenceKind.MANY_TO_MANY, enums_1.ReferenceKind.ONE_TO_MANY].includes(prop?.kind) && entity[prop.name] == null) {
            entity[prop.name] = Collection_1.Collection.create(entity, prop.name, undefined, (0, wrap_1.helper)(entity).isInitialized());
        }
        if (prop && Utils_1.Utils.isCollection(entity[prop.name])) {
            return EntityAssigner.assignCollection(entity, entity[prop.name], value, prop, options.em, options);
        }
        const customType = prop?.customType;
        if (options.convertCustomTypes && customType && prop.kind === enums_1.ReferenceKind.SCALAR && !Utils_1.Utils.isEntity(data)) {
            value = customType.convertToJSValue(value, options.platform);
        }
        if ([enums_1.ReferenceKind.MANY_TO_ONE, enums_1.ReferenceKind.ONE_TO_ONE].includes(prop?.kind) && value != null) {
            if (options.updateNestedEntities && Object.hasOwn(entity, propName) && Utils_1.Utils.isEntity(entity[propName], true) && Utils_1.Utils.isPlainObject(value)) {
                const unwrappedEntity = Reference_1.Reference.unwrapReference(entity[propName]);
                const wrapped = (0, wrap_1.helper)(unwrappedEntity);
                if (options.updateByPrimaryKey) {
                    const pk = Utils_1.Utils.extractPK(value, prop.targetMeta);
                    if (pk) {
                        const ref = options.em.getReference(prop.type, pk, options);
                        // if the PK differs, we want to change the target entity, not update it
                        const wrappedChild = (0, wrap_1.helper)(ref);
                        const sameTarget = wrappedChild.getSerializedPrimaryKey() === wrapped.getSerializedPrimaryKey();
                        if (wrappedChild.__managed && wrappedChild.isInitialized() && sameTarget) {
                            return EntityAssigner.assign(ref, value, options);
                        }
                    }
                    return EntityAssigner.assignReference(entity, value, prop, options.em, options);
                }
                if (wrapped.__managed && (0, wrap_1.wrap)(unwrappedEntity).isInitialized()) {
                    return EntityAssigner.assign(unwrappedEntity, value, options);
                }
            }
            return EntityAssigner.assignReference(entity, value, prop, options.em, options);
        }
        if (prop.kind === enums_1.ReferenceKind.SCALAR && enums_1.SCALAR_TYPES.includes(prop.runtimeType) && (prop.setter || !prop.getter)) {
            return entity[prop.name] = validator.validateProperty(prop, value, entity);
        }
        if (prop.kind === enums_1.ReferenceKind.EMBEDDED && EntityAssigner.validateEM(options.em)) {
            return EntityAssigner.assignEmbeddable(entity, value, prop, options.em, options);
        }
        if (options.mergeObjectProperties && Utils_1.Utils.isPlainObject(entity[propName]) && Utils_1.Utils.isPlainObject(value)) {
            entity[propName] ??= {};
            entity[propName] = Utils_1.Utils.merge({}, entity[propName], value);
        }
        else if (!prop || prop.setter || !prop.getter) {
            entity[propName] = value;
        }
    }
    /**
     * auto-wire 1:1 inverse side with owner as in no-sql drivers it can't be joined
     * also makes sure the link is bidirectional when creating new entities from nested structures
     * @internal
     */
    static autoWireOneToOne(prop, entity) {
        const ref = entity[prop.name];
        if (prop.kind !== enums_1.ReferenceKind.ONE_TO_ONE || !Utils_1.Utils.isEntity(ref)) {
            return;
        }
        const meta2 = (0, wrap_1.helper)(ref).__meta;
        const prop2 = meta2.properties[prop.inversedBy || prop.mappedBy];
        /* istanbul ignore next */
        if (prop2 && !ref[prop2.name]) {
            if (Reference_1.Reference.isReference(ref)) {
                ref.unwrap()[prop2.name] = Reference_1.Reference.wrapReference(entity, prop2);
            }
            else {
                ref[prop2.name] = Reference_1.Reference.wrapReference(entity, prop2);
            }
        }
    }
    static validateEM(em) {
        if (!em) {
            throw new Error(`To use assign() on not managed entities, explicitly provide EM instance: wrap(entity).assign(data, { em: orm.em })`);
        }
        return true;
    }
    static assignReference(entity, value, prop, em, options) {
        if (Utils_1.Utils.isEntity(value, true)) {
            entity[prop.name] = Reference_1.Reference.wrapReference(value, prop);
        }
        else if (Utils_1.Utils.isPrimaryKey(value, true) && EntityAssigner.validateEM(em)) {
            entity[prop.name] = prop.mapToPk ? value : Reference_1.Reference.wrapReference(em.getReference(prop.type, value, options), prop);
        }
        else if (Utils_1.Utils.isPlainObject(value) && options.merge && EntityAssigner.validateEM(em)) {
            entity[prop.name] = Reference_1.Reference.wrapReference(em.merge(prop.type, value, options), prop);
        }
        else if (Utils_1.Utils.isPlainObject(value) && EntityAssigner.validateEM(em)) {
            entity[prop.name] = Reference_1.Reference.wrapReference(em.create(prop.type, value, options), prop);
        }
        else {
            const name = entity.constructor.name;
            throw new Error(`Invalid reference value provided for '${name}.${prop.name}' in ${name}.assign(): ${JSON.stringify(value)}`);
        }
        EntityAssigner.autoWireOneToOne(prop, entity);
    }
    static assignCollection(entity, collection, value, prop, em, options) {
        const invalid = [];
        const items = Utils_1.Utils.asArray(value).map((item, idx) => {
            // try to propagate missing owning side reference to the payload first
            const prop2 = prop.targetMeta?.properties[prop.mappedBy];
            if (Utils_1.Utils.isPlainObject(item) && prop2 && item[prop2.name] == null) {
                item = { ...item, [prop2.name]: Reference_1.Reference.wrapReference(entity, prop2) };
            }
            if (options.updateNestedEntities && options.updateByPrimaryKey && Utils_1.Utils.isPlainObject(item)) {
                const pk = Utils_1.Utils.extractPK(item, prop.targetMeta);
                if (pk && EntityAssigner.validateEM(em)) {
                    const ref = em.getUnitOfWork().getById(prop.type, pk, options.schema);
                    /* istanbul ignore else */
                    if (ref) {
                        return EntityAssigner.assign(ref, item, options);
                    }
                }
                return this.createCollectionItem(item, em, prop, invalid, options);
            }
            /* istanbul ignore next */
            if (options.updateNestedEntities && !options.updateByPrimaryKey && collection[idx] && (0, wrap_1.helper)(collection[idx])?.isInitialized()) {
                return EntityAssigner.assign(collection[idx], item, options);
            }
            return this.createCollectionItem(item, em, prop, invalid, options);
        });
        if (invalid.length > 0) {
            const name = entity.constructor.name;
            throw new Error(`Invalid collection values provided for '${name}.${prop.name}' in ${name}.assign(): ${(0, node_util_1.inspect)(invalid)}`);
        }
        if (Array.isArray(value)) {
            collection.set(items);
        }
        else { // append to the collection in case of assigning a single value instead of array
            collection.add(items);
        }
    }
    static assignEmbeddable(entity, value, prop, em, options) {
        const propName = prop.embedded ? prop.embedded[1] : prop.name;
        if (value == null) {
            entity[propName] = value;
            return;
        }
        // if the value is not an array, we just push, otherwise we replace the array
        if (prop.array && (Array.isArray(value) || entity[propName] == null)) {
            entity[propName] = [];
        }
        if (prop.array) {
            return Utils_1.Utils.asArray(value).forEach(item => {
                const tmp = {};
                this.assignEmbeddable(tmp, item, { ...prop, array: false }, em, options);
                entity[propName].push(...Object.values(tmp));
            });
        }
        const create = () => EntityAssigner.validateEM(em) && em.getEntityFactory().createEmbeddable(prop.type, value, {
            convertCustomTypes: options.convertCustomTypes,
            newEntity: options.mergeEmbeddedProperties ? !('propName' in entity) : true,
        });
        entity[propName] = (options.mergeEmbeddedProperties ? (entity[propName] || create()) : create());
        Object.keys(value).forEach(key => {
            EntityAssigner.assignProperty(entity[propName], key, prop.embeddedProps, value, options);
        });
    }
    static createCollectionItem(item, em, prop, invalid, options) {
        if (Utils_1.Utils.isEntity(item)) {
            return item;
        }
        if (Utils_1.Utils.isPrimaryKey(item) && EntityAssigner.validateEM(em)) {
            return em.getReference(prop.type, item, options);
        }
        if (Utils_1.Utils.isPlainObject(item) && options.merge && EntityAssigner.validateEM(em)) {
            return em.merge(prop.type, item, options);
        }
        if (Utils_1.Utils.isPlainObject(item) && EntityAssigner.validateEM(em)) {
            return em.create(prop.type, item, options);
        }
        invalid.push(item);
        return item;
    }
}
exports.EntityAssigner = EntityAssigner;
exports.assign = EntityAssigner.assign;
