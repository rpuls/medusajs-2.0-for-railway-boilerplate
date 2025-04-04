"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WrappedEntity = void 0;
const node_util_1 = require("node:util");
const Reference_1 = require("./Reference");
const EntityTransformer_1 = require("../serialization/EntityTransformer");
const EntityAssigner_1 = require("./EntityAssigner");
const Utils_1 = require("../utils/Utils");
const errors_1 = require("../errors");
const wrap_1 = require("./wrap");
const EntitySerializer_1 = require("../serialization/EntitySerializer");
const utils_1 = require("./utils");
class WrappedEntity {
    constructor(entity, hydrator, pkGetter, pkSerializer, pkGetterConverted) {
        this.entity = entity;
        this.hydrator = hydrator;
        this.pkGetter = pkGetter;
        this.pkSerializer = pkSerializer;
        this.pkGetterConverted = pkGetterConverted;
        this.__initialized = true;
        this.__touched = false;
        this.__serializationContext = {};
        this.__loadedProperties = new Set();
        this.__data = {};
        this.__processing = false;
    }
    isInitialized() {
        return this.__initialized;
    }
    isTouched() {
        return this.__touched;
    }
    isManaged() {
        return !!this.__managed;
    }
    populated(populated = true) {
        this.__populated = populated;
    }
    setSerializationContext(options) {
        const exclude = options.exclude ?? [];
        const context = this.__serializationContext;
        const populate = (0, utils_1.expandDotPaths)(this.__meta, options.populate);
        context.populate = context.populate ? context.populate.concat(populate) : populate;
        context.exclude = context.exclude ? context.exclude.concat(exclude) : exclude;
        if (context.fields && options.fields) {
            options.fields.forEach(f => context.fields.add(f));
        }
        else if (options.fields) {
            context.fields = new Set(options.fields);
        }
        else {
            context.fields = new Set(['*']);
        }
    }
    toReference() {
        this.__reference ??= new Reference_1.Reference(this.entity);
        return this.__reference;
    }
    toObject(ignoreFields) {
        return EntityTransformer_1.EntityTransformer.toObject(this.entity, ignoreFields);
    }
    serialize(options) {
        return EntitySerializer_1.EntitySerializer.serialize(this.entity, options);
    }
    toPOJO() {
        return EntityTransformer_1.EntityTransformer.toObject(this.entity, [], true);
    }
    toJSON(...args) {
        // toJSON methods is added to the prototype during discovery to support automatic serialization via JSON.stringify()
        return this.entity.toJSON(...args);
    }
    assign(data, options) {
        if ('assign' in this.entity) {
            return this.entity.assign(data, options);
        }
        return EntityAssigner_1.EntityAssigner.assign(this.entity, data, options);
    }
    async init(options) {
        if (!this.__em) {
            throw errors_1.ValidationError.entityNotManaged(this.entity);
        }
        return this.__em.findOne(this.entity.constructor.name, this.entity, { ...options, refresh: true, schema: this.__schema });
    }
    async populate(populate, options = {}) {
        if (!this.__em) {
            throw errors_1.ValidationError.entityNotManaged(this.entity);
        }
        // @ts-ignore hard to type
        await this.__em.populate(this.entity, populate, options);
        return this.entity;
    }
    hasPrimaryKey() {
        const pk = this.getPrimaryKey();
        return pk != null;
    }
    getPrimaryKey(convertCustomTypes = false) {
        const prop = this.__meta.getPrimaryProps()[0];
        if (!prop) {
            return null;
        }
        if (this.__pk != null && this.__meta.compositePK) {
            return Utils_1.Utils.getCompositeKeyValue(this.__pk, this.__meta, convertCustomTypes ? 'convertToDatabaseValue' : false, this.__platform);
        }
        if (convertCustomTypes && this.__pk != null && prop.customType) {
            return prop.customType.convertToDatabaseValue(this.__pk, this.__platform);
        }
        if (convertCustomTypes) {
            return this.__pk ?? this.pkGetterConverted(this.entity);
        }
        return this.__pk ?? this.pkGetter(this.entity);
    }
    // this method is currently used only in `Driver.syncCollection` and can be probably removed
    getPrimaryKeys(convertCustomTypes = false) {
        const pk = this.getPrimaryKey(convertCustomTypes);
        if (pk == null) {
            return null;
        }
        if (this.__meta.compositePK) {
            return this.__meta.primaryKeys.reduce((ret, pk) => {
                const child = this.entity[pk];
                if (Utils_1.Utils.isEntity(child, true)) {
                    const childPk = (0, wrap_1.helper)(child).getPrimaryKeys(convertCustomTypes);
                    ret.push(...childPk);
                }
                else {
                    ret.push(child);
                }
                return ret;
            }, []);
        }
        return [pk];
    }
    getSchema() {
        return this.__schema;
    }
    setSchema(schema) {
        this.__schema = schema;
    }
    setPrimaryKey(id) {
        this.entity[this.__meta.primaryKeys[0]] = id;
        this.__pk = id;
    }
    getSerializedPrimaryKey() {
        return this.pkSerializer(this.entity);
    }
    get __meta() {
        return this.entity.__meta;
    }
    get __platform() {
        return this.entity.__platform;
    }
    get __config() {
        return this.__em?.config ?? this.entity.__config;
    }
    get __primaryKeys() {
        return Utils_1.Utils.getPrimaryKeyValues(this.entity, this.__meta.primaryKeys);
    }
    /** @ignore */
    [node_util_1.inspect.custom]() {
        return `[WrappedEntity<${this.__meta.className}>]`;
    }
}
exports.WrappedEntity = WrappedEntity;
