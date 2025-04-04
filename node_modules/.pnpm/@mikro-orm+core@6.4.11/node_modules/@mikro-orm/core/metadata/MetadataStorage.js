"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataStorage = void 0;
const typings_1 = require("../typings");
const Utils_1 = require("../utils/Utils");
const errors_1 = require("../errors");
const EntityHelper_1 = require("../entity/EntityHelper");
class MetadataStorage {
    static PATH_SYMBOL = Symbol('MetadataStorage.PATH_SYMBOL');
    static metadata = Utils_1.Utils.getGlobalStorage('metadata');
    metadata;
    constructor(metadata = {}) {
        this.metadata = Utils_1.Utils.copy(metadata, false);
    }
    static getMetadata(entity, path) {
        const key = entity && path ? entity + '-' + Utils_1.Utils.hash(path) : null;
        if (key && !MetadataStorage.metadata[key]) {
            MetadataStorage.metadata[key] = new typings_1.EntityMetadata({ className: entity, path });
        }
        if (key) {
            return MetadataStorage.metadata[key];
        }
        return MetadataStorage.metadata;
    }
    static isKnownEntity(name) {
        return !!Object.values(this.metadata).find(meta => meta.className === name);
    }
    static getMetadataFromDecorator(target) {
        if (!Object.hasOwn(target, MetadataStorage.PATH_SYMBOL)) {
            Object.defineProperty(target, MetadataStorage.PATH_SYMBOL, { value: Utils_1.Utils.lookupPathFromDecorator(target.name), writable: true });
        }
        return MetadataStorage.getMetadata(target.name, target[MetadataStorage.PATH_SYMBOL]);
    }
    static init() {
        return new MetadataStorage(MetadataStorage.metadata);
    }
    static clear() {
        Object.keys(this.metadata).forEach(k => delete this.metadata[k]);
    }
    getAll() {
        return this.metadata;
    }
    getByDiscriminatorColumn(meta, data) {
        const value = data[meta.root.discriminatorColumn];
        if (!value) {
            return undefined;
        }
        const type = meta.root.discriminatorMap[value];
        return this.metadata[type];
    }
    get(entityName, init = false, validate = true) {
        entityName = Utils_1.Utils.className(entityName);
        if (validate && !init && !this.has(entityName)) {
            throw errors_1.MetadataError.missingMetadata(entityName);
        }
        if (init && !this.has(entityName)) {
            this.metadata[entityName] = new typings_1.EntityMetadata();
        }
        return this.metadata[entityName];
    }
    find(entityName) {
        if (!entityName) {
            return;
        }
        entityName = Utils_1.Utils.className(entityName);
        return this.metadata[entityName];
    }
    has(entity) {
        return entity in this.metadata;
    }
    set(entity, meta) {
        return this.metadata[entity] = meta;
    }
    reset(entity) {
        delete this.metadata[entity];
    }
    decorate(em) {
        Object.values(this.metadata)
            .filter(meta => meta.prototype)
            .forEach(meta => EntityHelper_1.EntityHelper.decorate(meta, em));
    }
    *[Symbol.iterator]() {
        for (const meta of Object.values(this.metadata)) {
            yield meta;
        }
    }
}
exports.MetadataStorage = MetadataStorage;
