"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntity = void 0;
const Reference_1 = require("./Reference");
const EntityAssigner_1 = require("./EntityAssigner");
const EntitySerializer_1 = require("../serialization/EntitySerializer");
const wrap_1 = require("./wrap");
class BaseEntity {
    isInitialized() {
        return (0, wrap_1.helper)(this).__initialized;
    }
    isTouched() {
        return (0, wrap_1.helper)(this).__touched;
    }
    populated(populated = true) {
        (0, wrap_1.helper)(this).populated(populated);
    }
    async populate(populate, options = {}) {
        return (0, wrap_1.helper)(this).populate(populate, options);
    }
    toReference() {
        return Reference_1.Reference.create(this);
    }
    toObject(ignoreFields) {
        return (0, wrap_1.helper)(this).toObject(ignoreFields);
    }
    toPOJO() {
        return (0, wrap_1.helper)(this).toPOJO();
    }
    serialize(options) {
        return EntitySerializer_1.EntitySerializer.serialize(this, options);
    }
    assign(data, options = {}) {
        return EntityAssigner_1.EntityAssigner.assign(this, data, options);
    }
    init(options) {
        return (0, wrap_1.helper)(this).init(options);
    }
    getSchema() {
        return (0, wrap_1.helper)(this).getSchema();
    }
    setSchema(schema) {
        (0, wrap_1.helper)(this).setSchema(schema);
    }
}
exports.BaseEntity = BaseEntity;
Object.defineProperty(BaseEntity.prototype, '__baseEntity', { value: true, writable: false, enumerable: false });
