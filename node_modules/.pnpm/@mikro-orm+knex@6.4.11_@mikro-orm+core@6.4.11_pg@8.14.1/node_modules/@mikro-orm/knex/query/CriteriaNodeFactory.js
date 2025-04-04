"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CriteriaNodeFactory = void 0;
const core_1 = require("@mikro-orm/core");
const ObjectCriteriaNode_1 = require("./ObjectCriteriaNode");
const ArrayCriteriaNode_1 = require("./ArrayCriteriaNode");
const ScalarCriteriaNode_1 = require("./ScalarCriteriaNode");
/**
 * @internal
 */
class CriteriaNodeFactory {
    static createNode(metadata, entityName, payload, parent, key) {
        const customExpression = core_1.RawQueryFragment.isKnownFragment(key || '');
        const scalar = core_1.Utils.isPrimaryKey(payload) || core_1.Utils.isRawSql(payload) || payload instanceof RegExp || payload instanceof Date || customExpression;
        if (Array.isArray(payload) && !scalar) {
            return this.createArrayNode(metadata, entityName, payload, parent, key);
        }
        if (core_1.Utils.isPlainObject(payload) && !scalar) {
            return this.createObjectNode(metadata, entityName, payload, parent, key);
        }
        return this.createScalarNode(metadata, entityName, payload, parent, key);
    }
    static createScalarNode(metadata, entityName, payload, parent, key) {
        const node = new ScalarCriteriaNode_1.ScalarCriteriaNode(metadata, entityName, parent, key);
        node.payload = payload;
        return node;
    }
    static createArrayNode(metadata, entityName, payload, parent, key) {
        const node = new ArrayCriteriaNode_1.ArrayCriteriaNode(metadata, entityName, parent, key);
        node.payload = payload.map((item, index) => {
            const n = this.createNode(metadata, entityName, item, node);
            // we care about branching only for $and
            if (key === '$and' && payload.length > 1) {
                n.index = index;
            }
            return n;
        });
        return node;
    }
    static createObjectNode(metadata, entityName, payload, parent, key) {
        const meta = metadata.find(entityName);
        const node = new ObjectCriteriaNode_1.ObjectCriteriaNode(metadata, entityName, parent, key);
        node.payload = Object.keys(payload).reduce((o, item) => {
            o[item] = this.createObjectItemNode(metadata, entityName, node, payload, item, meta);
            return o;
        }, {});
        return node;
    }
    static createObjectItemNode(metadata, entityName, node, payload, key, meta) {
        const prop = meta?.properties[key];
        const childEntity = prop && prop.kind !== core_1.ReferenceKind.SCALAR ? prop.type : entityName;
        if (prop?.customType instanceof core_1.JsonType) {
            return this.createScalarNode(metadata, childEntity, payload[key], node, key);
        }
        if (prop?.kind !== core_1.ReferenceKind.EMBEDDED) {
            return this.createNode(metadata, childEntity, payload[key], node, key);
        }
        if (payload[key] == null) {
            const map = Object.keys(prop.embeddedProps).reduce((oo, k) => {
                oo[prop.embeddedProps[k].name] = null;
                return oo;
            }, {});
            return this.createNode(metadata, entityName, map, node, key);
        }
        // array operators can be used on embedded properties
        const allowedOperators = ['$contains', '$contained', '$overlap'];
        const operator = Object.keys(payload[key]).some(f => core_1.Utils.isOperator(f) && !allowedOperators.includes(f));
        if (operator) {
            throw core_1.ValidationError.cannotUseOperatorsInsideEmbeddables(entityName, prop.name, payload);
        }
        const map = Object.keys(payload[key]).reduce((oo, k) => {
            if (!prop.embeddedProps[k] && !allowedOperators.includes(k)) {
                throw core_1.ValidationError.invalidEmbeddableQuery(entityName, k, prop.type);
            }
            if (prop.embeddedProps[k]) {
                oo[prop.embeddedProps[k].name] = payload[key][k];
            }
            else if (typeof payload[key][k] === 'object') {
                oo[k] = JSON.stringify(payload[key][k]);
            }
            else {
                oo[k] = payload[key][k];
            }
            return oo;
        }, {});
        return this.createNode(metadata, entityName, map, node, key);
    }
}
exports.CriteriaNodeFactory = CriteriaNodeFactory;
