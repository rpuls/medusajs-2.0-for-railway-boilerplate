"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitySchema = void 0;
const typings_1 = require("../typings");
const BaseEntity_1 = require("../entity/BaseEntity");
const enums_1 = require("../enums");
const types_1 = require("../types");
const utils_1 = require("../utils");
const EnumArrayType_1 = require("../types/EnumArrayType");
class EntitySchema {
    /**
     * When schema links the entity class via `class` option, this registry allows the lookup from opposite side,
     * so we can use the class in `entities` option just like the EntitySchema instance.
     */
    static REGISTRY = new Map();
    _meta = new typings_1.EntityMetadata();
    internal = false;
    initialized = false;
    constructor(meta) {
        meta.name = meta.class ? meta.class.name : meta.name;
        if (meta.name) {
            meta.abstract ??= false;
        }
        if (meta.class && !meta.internal) {
            EntitySchema.REGISTRY.set(meta.class, this);
        }
        if (meta.tableName || meta.collection) {
            utils_1.Utils.renameKey(meta, 'tableName', 'collection');
            meta.tableName = meta.collection;
        }
        Object.assign(this._meta, { className: meta.name }, meta);
        this._meta.root ??= this._meta;
    }
    static fromMetadata(meta) {
        const schema = new EntitySchema({ ...meta, internal: true });
        schema.internal = true;
        return schema;
    }
    addProperty(name, type, options = {}) {
        const rename = (data, from, to) => {
            if (from in options && !(to in options)) {
                // @ts-ignore
                options[to] = [options[from]];
                // @ts-ignore
                delete options[from];
            }
        };
        if (name !== options.name) {
            utils_1.Utils.renameKey(options, 'name', 'fieldName');
        }
        rename(options, 'fieldName', 'fieldNames');
        rename(options, 'ref', 'ref');
        rename(options, 'joinColumn', 'joinColumns');
        rename(options, 'inverseJoinColumn', 'inverseJoinColumns');
        rename(options, 'referenceColumnName', 'referencedColumnNames');
        rename(options, 'columnType', 'columnTypes');
        const prop = { name, kind: enums_1.ReferenceKind.SCALAR, ...options, type: this.normalizeType(options, type) };
        if (type && types_1.Type.isMappedType(type.prototype)) {
            prop.type = type;
        }
        if (utils_1.Utils.isString(prop.formula)) {
            const formula = prop.formula; // tmp var is needed here
            prop.formula = () => formula;
        }
        if (prop.formula) {
            prop.persist ??= false;
        }
        this._meta.properties[name] = prop;
    }
    addEnum(name, type, options = {}) {
        if (options.items instanceof Function) {
            options.items = utils_1.Utils.extractEnumValues(options.items());
        }
        // enum arrays are simple numeric/string arrays, the constraint is enforced in the custom type only
        if (options.array && !options.type) {
            options.type = new EnumArrayType_1.EnumArrayType(`${this._meta.className}.${name}`, options.items);
            options.enum = false;
        }
        const prop = { enum: true, ...options };
        if (prop.array) {
            prop.enum = false;
        }
        // force string labels on native enums
        if (prop.nativeEnumName && Array.isArray(prop.items)) {
            prop.items = prop.items.map(val => '' + val);
        }
        this.addProperty(name, this.internal ? type : type || 'enum', prop);
    }
    addVersion(name, type, options = {}) {
        this.addProperty(name, type, { version: true, ...options });
    }
    addPrimaryKey(name, type, options = {}) {
        this.addProperty(name, type, { primary: true, ...options });
    }
    addSerializedPrimaryKey(name, type, options = {}) {
        this._meta.serializedPrimaryKey = name;
        this.addProperty(name, type, options);
    }
    addEmbedded(name, options) {
        utils_1.Utils.defaultValue(options, 'prefix', true);
        if (options.array) {
            options.object = true; // force object mode for arrays
        }
        this._meta.properties[name] = {
            name,
            type: this.normalizeType(options),
            kind: enums_1.ReferenceKind.EMBEDDED,
            ...options,
        };
    }
    addManyToOne(name, type, options) {
        const prop = this.createProperty(enums_1.ReferenceKind.MANY_TO_ONE, options);
        prop.owner = true;
        if (prop.joinColumns && !prop.fieldNames) {
            prop.fieldNames = prop.joinColumns;
        }
        if (prop.fieldNames && !prop.joinColumns) {
            prop.joinColumns = prop.fieldNames;
        }
        this.addProperty(name, type, prop);
    }
    addManyToMany(name, type, options) {
        options.fixedOrder = options.fixedOrder || !!options.fixedOrderColumn;
        if (!options.owner && !options.mappedBy) {
            options.owner = true;
        }
        if (options.owner) {
            utils_1.Utils.renameKey(options, 'mappedBy', 'inversedBy');
        }
        const prop = this.createProperty(enums_1.ReferenceKind.MANY_TO_MANY, options);
        this.addProperty(name, type, prop);
    }
    addOneToMany(name, type, options) {
        const prop = this.createProperty(enums_1.ReferenceKind.ONE_TO_MANY, options);
        this.addProperty(name, type, prop);
    }
    addOneToOne(name, type, options) {
        const prop = this.createProperty(enums_1.ReferenceKind.ONE_TO_ONE, options);
        utils_1.Utils.defaultValue(prop, 'owner', !!prop.inversedBy || !prop.mappedBy);
        utils_1.Utils.defaultValue(prop, 'unique', prop.owner);
        if (prop.owner && options.mappedBy) {
            utils_1.Utils.renameKey(prop, 'mappedBy', 'inversedBy');
        }
        if (prop.joinColumns && !prop.fieldNames) {
            prop.fieldNames = prop.joinColumns;
        }
        if (prop.fieldNames && !prop.joinColumns) {
            prop.joinColumns = prop.fieldNames;
        }
        this.addProperty(name, type, prop);
    }
    addIndex(options) {
        this._meta.indexes.push(options);
    }
    addUnique(options) {
        this._meta.uniques.push(options);
    }
    setCustomRepository(repository) {
        this._meta.repository = repository;
    }
    setExtends(base) {
        this._meta.extends = base;
    }
    setClass(proto) {
        const sameClass = this._meta.className === proto.name;
        this._meta.class = proto;
        this._meta.prototype = proto.prototype;
        this._meta.className = proto.name;
        if (!sameClass || !this._meta.constructorParams) {
            const tokens = utils_1.Utils.tokenize(proto);
            this._meta.constructorParams = utils_1.Utils.getParamNames(tokens, 'constructor');
            this._meta.toJsonParams = utils_1.Utils.getParamNames(tokens, 'toJSON').filter(p => p !== '...args');
        }
        if (!this.internal) {
            EntitySchema.REGISTRY.set(proto, this);
        }
        if (Object.getPrototypeOf(proto) !== BaseEntity_1.BaseEntity) {
            this._meta.extends = this._meta.extends || Object.getPrototypeOf(proto).name || undefined;
        }
    }
    get meta() {
        return this._meta;
    }
    get name() {
        return this._meta.className;
    }
    /**
     * @internal
     */
    init() {
        if (this.initialized) {
            return this;
        }
        if (!this._meta.class) {
            const name = this.name;
            this._meta.class = ({ [name]: class {
                } })[name];
        }
        this.setClass(this._meta.class);
        if (this._meta.abstract && !this._meta.discriminatorColumn) {
            delete this._meta.name;
        }
        const tableName = this._meta.collection ?? this._meta.tableName;
        if (tableName?.includes('.') && !this._meta.schema) {
            this._meta.schema = tableName.substring(0, tableName.indexOf('.'));
            this._meta.collection = tableName.substring(tableName.indexOf('.') + 1);
        }
        this.initProperties();
        this.initPrimaryKeys();
        this._meta.props = Object.values(this._meta.properties);
        this._meta.relations = this._meta.props.filter(prop => typeof prop.kind !== 'undefined' && prop.kind !== enums_1.ReferenceKind.SCALAR && prop.kind !== enums_1.ReferenceKind.EMBEDDED);
        this.initialized = true;
        return this;
    }
    initProperties() {
        utils_1.Utils.entries(this._meta.properties).forEach(([name, options]) => {
            if (types_1.Type.isMappedType(options.type)) {
                options.type ??= options.type.constructor.name;
            }
            switch (options.kind) {
                case enums_1.ReferenceKind.ONE_TO_ONE:
                    this.addOneToOne(name, options.type, options);
                    break;
                case enums_1.ReferenceKind.ONE_TO_MANY:
                    this.addOneToMany(name, options.type, options);
                    break;
                case enums_1.ReferenceKind.MANY_TO_ONE:
                    this.addManyToOne(name, options.type, options);
                    break;
                case enums_1.ReferenceKind.MANY_TO_MANY:
                    this.addManyToMany(name, options.type, options);
                    break;
                case enums_1.ReferenceKind.EMBEDDED:
                    this.addEmbedded(name, options);
                    break;
                default:
                    if (options.enum) {
                        this.addEnum(name, options.type, options);
                    }
                    else if (options.primary) {
                        this.addPrimaryKey(name, options.type, options);
                    }
                    else if (options.serializedPrimaryKey) {
                        this.addSerializedPrimaryKey(name, options.type, options);
                    }
                    else if (options.version) {
                        this.addVersion(name, options.type, options);
                    }
                    else {
                        this.addProperty(name, options.type, options);
                    }
            }
        });
    }
    initPrimaryKeys() {
        const pks = Object.values(this._meta.properties).filter(prop => prop.primary);
        if (pks.length > 0) {
            this._meta.primaryKeys = pks.map(prop => prop.name);
            this._meta.compositePK = pks.length > 1;
            this._meta.simplePK = !this._meta.compositePK && pks[0].kind === enums_1.ReferenceKind.SCALAR && !pks[0].customType;
        }
        if (pks.length === 1 && ['number', 'bigint'].includes(pks[0].type)) {
            pks[0].autoincrement ??= true;
        }
        const serializedPrimaryKey = Object.values(this._meta.properties).find(prop => prop.serializedPrimaryKey);
        if (serializedPrimaryKey) {
            this._meta.serializedPrimaryKey = serializedPrimaryKey.name;
        }
    }
    normalizeType(options, type) {
        if ('entity' in options) {
            if (utils_1.Utils.isString(options.entity)) {
                type = options.type = options.entity;
            }
            else if (options.entity) {
                const tmp = options.entity();
                type = options.type = Array.isArray(tmp) ? tmp.map(t => utils_1.Utils.className(t)).sort().join(' | ') : utils_1.Utils.className(tmp);
            }
        }
        if (type instanceof Function) {
            type = type.name;
        }
        if (['String', 'Number', 'Boolean', 'Array'].includes(type)) {
            type = type.toLowerCase();
        }
        return type;
    }
    createProperty(kind, options) {
        return {
            kind,
            cascade: [enums_1.Cascade.PERSIST],
            ...options,
        };
    }
}
exports.EntitySchema = EntitySchema;
