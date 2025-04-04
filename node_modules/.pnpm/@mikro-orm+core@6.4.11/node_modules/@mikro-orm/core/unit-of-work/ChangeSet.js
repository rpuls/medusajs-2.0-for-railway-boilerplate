"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeSetType = exports.ChangeSet = void 0;
const node_util_1 = require("node:util");
const wrap_1 = require("../entity/wrap");
const Utils_1 = require("../utils/Utils");
class ChangeSet {
    entity;
    type;
    payload;
    meta;
    primaryKey;
    serializedPrimaryKey;
    constructor(entity, type, payload, meta) {
        this.entity = entity;
        this.type = type;
        this.payload = payload;
        this.meta = meta;
        this.name = meta.className;
        this.rootName = meta.root.className;
        this.collection = meta.root.collection;
        this.schema = (0, wrap_1.helper)(entity).__schema ?? meta.root.schema;
    }
    getPrimaryKey(object = false) {
        if (!this.originalEntity) {
            this.primaryKey ??= (0, wrap_1.helper)(this.entity).getPrimaryKey(true);
        }
        else if (this.meta.compositePK) {
            this.primaryKey = this.meta.primaryKeys.map(pk => this.originalEntity[pk]);
        }
        else {
            this.primaryKey = this.originalEntity[this.meta.primaryKeys[0]];
        }
        if (!this.meta.compositePK
            && this.meta.getPrimaryProp().targetMeta?.compositePK
            && typeof this.primaryKey === 'object'
            && this.primaryKey !== null) {
            this.primaryKey = this.meta.getPrimaryProp().targetMeta.primaryKeys.map(childPK => {
                return this.primaryKey[childPK];
            });
        }
        if (object && this.primaryKey != null) {
            return Utils_1.Utils.primaryKeyToObject(this.meta, this.primaryKey);
        }
        return this.primaryKey ?? null;
    }
    getSerializedPrimaryKey() {
        this.serializedPrimaryKey ??= (0, wrap_1.helper)(this.entity).getSerializedPrimaryKey();
        return this.serializedPrimaryKey;
    }
    /** @ignore */
    [node_util_1.inspect.custom](depth = 2) {
        const object = { ...this };
        const hidden = ['meta', 'serializedPrimaryKey'];
        hidden.forEach(k => delete object[k]);
        const ret = (0, node_util_1.inspect)(object, { depth });
        const name = `${this.constructor.name}<${this.meta.className}>`;
        /* istanbul ignore next */
        return ret === '[Object]' ? `[${name}]` : name + ' ' + ret;
    }
}
exports.ChangeSet = ChangeSet;
var ChangeSetType;
(function (ChangeSetType) {
    ChangeSetType["CREATE"] = "create";
    ChangeSetType["UPDATE"] = "update";
    ChangeSetType["DELETE"] = "delete";
    ChangeSetType["UPDATE_EARLY"] = "update_early";
    ChangeSetType["DELETE_EARLY"] = "delete_early";
})(ChangeSetType || (exports.ChangeSetType = ChangeSetType = {}));
