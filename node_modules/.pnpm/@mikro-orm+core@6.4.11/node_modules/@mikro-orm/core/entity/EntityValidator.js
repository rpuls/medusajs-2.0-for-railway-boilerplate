"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityValidator = void 0;
const enums_1 = require("../enums");
const Utils_1 = require("../utils/Utils");
const errors_1 = require("../errors");
const wrap_1 = require("./wrap");
const RawQueryFragment_1 = require("../utils/RawQueryFragment");
class EntityValidator {
    strict;
    KNOWN_TYPES = new Set(['string', 'number', 'boolean', 'bigint', 'Uint8Array', 'Date', 'Buffer', 'RegExp']);
    constructor(strict) {
        this.strict = strict;
    }
    validate(entity, payload, meta) {
        meta.props.forEach(prop => {
            if (prop.inherited) {
                return;
            }
            if ([enums_1.ReferenceKind.ONE_TO_MANY, enums_1.ReferenceKind.MANY_TO_MANY].includes(prop.kind)) {
                this.validateCollection(entity, prop);
            }
            const SCALAR_TYPES = ['string', 'number', 'boolean', 'Date'];
            if (prop.kind !== enums_1.ReferenceKind.SCALAR || !SCALAR_TYPES.includes(prop.type)) {
                return;
            }
            const newValue = this.validateProperty(prop, this.getValue(payload, prop), entity);
            if (this.getValue(payload, prop) === newValue) {
                return;
            }
            this.setValue(payload, prop, newValue);
            /* istanbul ignore else */
            if (entity[prop.name]) {
                entity[prop.name] = payload[prop.name];
            }
        });
    }
    validateRequired(entity) {
        const wrapped = (0, wrap_1.helper)(entity);
        for (const prop of wrapped.__meta.props) {
            if (!prop.nullable &&
                !prop.autoincrement &&
                !prop.default &&
                !prop.defaultRaw &&
                !prop.onCreate &&
                !prop.generated &&
                !prop.embedded &&
                ![enums_1.ReferenceKind.ONE_TO_MANY, enums_1.ReferenceKind.MANY_TO_MANY].includes(prop.kind) &&
                prop.name !== wrapped.__meta.root.discriminatorColumn &&
                prop.type.toLowerCase() !== 'objectid' &&
                prop.persist !== false &&
                entity[prop.name] == null) {
                throw errors_1.ValidationError.propertyRequired(entity, prop);
            }
        }
    }
    validateProperty(prop, givenValue, entity) {
        if (givenValue == null || givenValue instanceof RawQueryFragment_1.RawQueryFragment) {
            return givenValue;
        }
        const expectedType = prop.runtimeType;
        const propName = prop.embedded ? prop.name.replace(/~/g, '.') : prop.name;
        let givenType = Utils_1.Utils.getObjectType(givenValue);
        let ret = givenValue;
        if (!this.strict) {
            ret = this.fixTypes(expectedType, givenType, givenValue);
            givenType = Utils_1.Utils.getObjectType(ret);
        }
        if (prop.enum && prop.items) {
            if (!prop.items.some(it => it === givenValue)) {
                throw errors_1.ValidationError.fromWrongPropertyType(entity, propName, expectedType, givenType, givenValue);
            }
        }
        else {
            if (givenType !== expectedType && this.KNOWN_TYPES.has(expectedType)) {
                throw errors_1.ValidationError.fromWrongPropertyType(entity, propName, expectedType, givenType, givenValue);
            }
        }
        return ret;
    }
    validateParams(params, type = 'search condition', field) {
        if (Utils_1.Utils.isPrimaryKey(params) || Utils_1.Utils.isEntity(params)) {
            return;
        }
        if (Array.isArray(params)) {
            return params.forEach(item => this.validateParams(item, type, field));
        }
        if (Utils_1.Utils.isPlainObject(params)) {
            Object.keys(params).forEach(k => {
                this.validateParams(params[k], type, k);
            });
        }
    }
    validatePrimaryKey(entity, meta) {
        const pkExists = meta.primaryKeys.every(pk => entity[pk] != null) || entity[meta.serializedPrimaryKey] != null;
        if (!entity || !pkExists) {
            throw errors_1.ValidationError.fromMergeWithoutPK(meta);
        }
    }
    validateEmptyWhere(where) {
        if (Utils_1.Utils.isEmpty(where)) {
            throw new Error(`You cannot call 'EntityManager.findOne()' with empty 'where' parameter`);
        }
    }
    getValue(o, prop) {
        if (prop.embedded && prop.embedded[0] in o) {
            return o[prop.embedded[0]]?.[prop.embedded[1]];
        }
        return o[prop.name];
    }
    setValue(o, prop, v) {
        /* istanbul ignore next */
        if (prop.embedded && prop.embedded[0] in o) {
            return o[prop.embedded[0]][prop.embedded[1]] = v;
        }
        o[prop.name] = v;
    }
    validateCollection(entity, prop) {
        if (prop.hydrate !== false && (0, wrap_1.helper)(entity).__initialized && !entity[prop.name]) {
            throw errors_1.ValidationError.fromCollectionNotInitialized(entity, prop);
        }
    }
    fixTypes(expectedType, givenType, givenValue) {
        if (expectedType === 'Date' && ['string', 'number'].includes(givenType)) {
            givenValue = this.fixDateType(givenValue);
        }
        if (expectedType === 'number' && givenType === 'string') {
            givenValue = this.fixNumberType(givenValue);
        }
        if (expectedType === 'boolean' && givenType === 'number') {
            givenValue = this.fixBooleanType(givenValue);
        }
        return givenValue;
    }
    fixDateType(givenValue) {
        let date;
        if (Utils_1.Utils.isString(givenValue) && givenValue.match(/^-?\d+(\.\d+)?$/)) {
            date = new Date(+givenValue);
        }
        else {
            date = new Date(givenValue);
        }
        return date.toString() !== 'Invalid Date' ? date : givenValue;
    }
    fixNumberType(givenValue) {
        const num = +givenValue;
        return '' + num === givenValue ? num : givenValue;
    }
    fixBooleanType(givenValue) {
        const bool = !!givenValue;
        return +bool === givenValue ? bool : givenValue;
    }
}
exports.EntityValidator = EntityValidator;
