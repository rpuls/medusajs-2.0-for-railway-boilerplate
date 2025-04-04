"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ref = exports.ScalarReference = exports.Reference = void 0;
exports.ref = ref;
exports.rel = rel;
const node_util_1 = require("node:util");
const enums_1 = require("../enums");
const wrap_1 = require("./wrap");
const utils_1 = require("../utils");
class Reference {
    entity;
    constructor(entity) {
        this.entity = entity;
        this.set(entity);
        const meta = (0, wrap_1.helper)(this.entity).__meta;
        meta.primaryKeys.forEach(primaryKey => {
            Object.defineProperty(this, primaryKey, {
                get() {
                    return this.entity[primaryKey];
                },
            });
        });
        if (meta.serializedPrimaryKey && meta.primaryKeys[0] !== meta.serializedPrimaryKey) {
            Object.defineProperty(this, meta.serializedPrimaryKey, {
                get() {
                    return (0, wrap_1.helper)(this.entity).getSerializedPrimaryKey();
                },
            });
        }
    }
    static create(entity) {
        const unwrapped = Reference.unwrapReference(entity);
        const ref = (0, wrap_1.helper)(entity).toReference();
        if (unwrapped !== ref.unwrap()) {
            ref.set(unwrapped);
        }
        return ref;
    }
    static createFromPK(entityType, pk, options) {
        const ref = this.createNakedFromPK(entityType, pk, options);
        return (0, wrap_1.helper)(ref).toReference();
    }
    static createNakedFromPK(entityType, pk, options) {
        const factory = entityType.prototype.__factory;
        const entity = factory.createReference(entityType, pk, {
            merge: false,
            convertCustomTypes: false,
            ...options,
        });
        const wrapped = (0, wrap_1.helper)(entity);
        wrapped.__meta.primaryKeys.forEach(key => wrapped.__loadedProperties.add(key));
        wrapped.__originalEntityData = factory.getComparator().prepareEntity(entity);
        return entity;
    }
    /**
     * Checks whether the argument is instance of `Reference` wrapper.
     */
    static isReference(data) {
        return data && !!data.__reference;
    }
    /**
     * Wraps the entity in a `Reference` wrapper if the property is defined as `ref`.
     */
    static wrapReference(entity, prop) {
        if (entity && prop.ref && !Reference.isReference(entity)) {
            return Reference.create(entity);
        }
        return entity;
    }
    /**
     * Returns wrapped entity.
     */
    static unwrapReference(ref) {
        return Reference.isReference(ref) ? ref.unwrap() : ref;
    }
    /**
     * Ensures the underlying entity is loaded first (without reloading it if it already is loaded). Returns the entity.
     * If the entity is not found in the database (e.g. it was deleted in the meantime, or currently active filters disallow loading of it)
     * the method returns `null`. Use `loadOrFail()` if you want an error to be thrown in such a case.
     */
    async load(options = {}) {
        const wrapped = (0, wrap_1.helper)(this.entity);
        if (!wrapped.__em) {
            return this.entity;
        }
        if (this.isInitialized() && !options.refresh && options.populate) {
            await wrapped.__em.populate(this.entity, options.populate, options);
        }
        if (!this.isInitialized() || options.refresh) {
            if (options.dataloader ?? [enums_1.DataloaderType.ALL, enums_1.DataloaderType.REFERENCE].includes(utils_1.DataloaderUtils.getDataloaderType(wrapped.__em.config.get('dataloader')))) {
                // eslint-disable-next-line dot-notation
                return wrapped.__em['refLoader'].load([this, options]);
            }
            return wrapped.init(options);
        }
        return this.entity;
    }
    /**
     * Ensures the underlying entity is loaded first (without reloading it if it already is loaded).
     * Returns the entity or throws an error just like `em.findOneOrFail()` (and respects the same config options).
     */
    async loadOrFail(options = {}) {
        const ret = await this.load(options);
        if (!ret) {
            const wrapped = (0, wrap_1.helper)(this.entity);
            options.failHandler ??= wrapped.__em.config.get('findOneOrFailHandler');
            const entityName = this.entity.constructor.name;
            const where = wrapped.getPrimaryKey();
            throw options.failHandler(entityName, where);
        }
        return ret;
    }
    set(entity) {
        this.entity = Reference.unwrapReference(entity);
        delete (0, wrap_1.helper)(this.entity).__reference;
    }
    unwrap() {
        return this.entity;
    }
    getEntity() {
        if (!this.isInitialized()) {
            throw new Error(`Reference<${(0, wrap_1.helper)(this.entity).__meta.name}> ${(0, wrap_1.helper)(this.entity).getPrimaryKey()} not initialized`);
        }
        return this.entity;
    }
    getProperty(prop) {
        return this.getEntity()[prop];
    }
    async loadProperty(prop, options) {
        await this.loadOrFail(options);
        return this.getEntity()[prop];
    }
    isInitialized() {
        return (0, wrap_1.helper)(this.entity).__initialized;
    }
    populated(populated) {
        (0, wrap_1.helper)(this.entity).populated(populated);
    }
    toJSON(...args) {
        return (0, wrap_1.wrap)(this.entity).toJSON(...args);
    }
    /* istanbul ignore next */
    /** @ignore */
    [node_util_1.inspect.custom](depth = 2) {
        const object = { ...this };
        const hidden = ['meta'];
        hidden.forEach(k => delete object[k]);
        const ret = (0, node_util_1.inspect)(object, { depth });
        const wrapped = (0, wrap_1.helper)(this.entity);
        const meta = wrapped.__meta;
        const pk = wrapped.hasPrimaryKey() ? '<' + wrapped.getSerializedPrimaryKey() + '>' : '';
        const name = `Ref<${meta.className}${pk}>`;
        return ret === '[Object]' ? `[${name}]` : name + ' ' + ret;
    }
}
exports.Reference = Reference;
exports.Ref = Reference;
class ScalarReference {
    value;
    initialized;
    entity;
    property;
    constructor(value, initialized = value != null) {
        this.value = value;
        this.initialized = initialized;
    }
    /**
     * Ensures the underlying entity is loaded first (without reloading it if it already is loaded).
     * Returns either the whole entity, or the requested property.
     */
    async load(options) {
        const opts = typeof options === 'object' ? options : { prop: options };
        if (!this.initialized || opts.refresh) {
            if (this.entity == null || this.property == null) {
                throw new Error('Cannot load scalar reference that is not bound to an entity property.');
            }
            await (0, wrap_1.helper)(this.entity).populate([this.property], opts);
        }
        return this.value;
    }
    set(value) {
        this.value = value;
        this.initialized = true;
    }
    bind(entity, property) {
        this.entity = entity;
        this.property = property;
        Object.defineProperty(this, 'entity', { enumerable: false, value: entity });
    }
    unwrap() {
        return this.value;
    }
    isInitialized() {
        return this.initialized;
    }
    /* istanbul ignore next */
    /** @ignore */
    [node_util_1.inspect.custom]() {
        return this.initialized ? `Ref<${(0, node_util_1.inspect)(this.value)}>` : `Ref<?>`;
    }
}
exports.ScalarReference = ScalarReference;
Object.defineProperties(Reference.prototype, {
    __reference: { value: true, enumerable: false },
    __meta: { get() { return this.entity.__meta; } },
    __platform: { get() { return this.entity.__platform; } },
    __helper: { get() { return this.entity.__helper; } },
    $: { get() { return this.entity; } },
    get: { get() { return () => this.entity; } },
});
Object.defineProperties(ScalarReference.prototype, {
    __scalarReference: { value: true, enumerable: false },
    $: { get() { return this.value; } },
    get: { get() { return () => this.value; } },
});
/**
 * shortcut for `wrap(entity).toReference()`
 */
function ref(entityOrType, pk) {
    if (entityOrType == null) {
        return entityOrType;
    }
    if (utils_1.Utils.isEntity(entityOrType, true)) {
        return (0, wrap_1.helper)(entityOrType).toReference();
    }
    if (utils_1.Utils.isEntity(pk, true)) {
        return (0, wrap_1.helper)(pk).toReference();
    }
    if (arguments.length === 1) {
        return new ScalarReference(entityOrType, true);
    }
    if (pk == null) {
        return pk;
    }
    return Reference.createFromPK(entityOrType, pk);
}
/**
 * shortcut for `Reference.createNakedFromPK(entityType, pk)`
 */
function rel(entityType, pk) {
    if (pk == null || utils_1.Utils.isEntity(pk)) {
        return pk;
    }
    return Reference.createNakedFromPK(entityType, pk);
}
