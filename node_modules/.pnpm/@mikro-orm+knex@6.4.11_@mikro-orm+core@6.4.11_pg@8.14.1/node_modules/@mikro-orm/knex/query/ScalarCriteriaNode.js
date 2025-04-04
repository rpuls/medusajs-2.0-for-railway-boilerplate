"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScalarCriteriaNode = void 0;
const core_1 = require("@mikro-orm/core");
const CriteriaNode_1 = require("./CriteriaNode");
const enums_1 = require("./enums");
/**
 * @internal
 */
class ScalarCriteriaNode extends CriteriaNode_1.CriteriaNode {
    process(qb, options) {
        if (this.shouldJoin()) {
            const path = this.getPath();
            const parentPath = this.parent.getPath(); // the parent is always there, otherwise `shouldJoin` would return `false`
            const nestedAlias = qb.getAliasForJoinPath(path) || qb.getNextAlias(this.prop?.pivotTable ?? this.entityName);
            const field = this.aliased(this.prop.name, options?.alias);
            const type = this.prop.kind === core_1.ReferenceKind.MANY_TO_MANY ? enums_1.JoinType.pivotJoin : enums_1.JoinType.leftJoin;
            qb.join(field, nestedAlias, undefined, type, path);
            // select the owner as virtual property when joining from 1:1 inverse side, but only if the parent is root entity
            if (this.prop.kind === core_1.ReferenceKind.ONE_TO_ONE && !parentPath.includes('.') && !qb._fields?.includes(field)) {
                qb.addSelect(field);
            }
        }
        if (this.payload && typeof this.payload === 'object') {
            const keys = Object.keys(this.payload).filter(key => core_1.Utils.isArrayOperator(key) && Array.isArray(this.payload[key]));
            for (const key of keys) {
                this.payload[key] = JSON.stringify(this.payload[key]);
            }
        }
        return this.payload;
    }
    willAutoJoin(qb, alias, options) {
        return this.shouldJoin();
    }
    shouldJoin() {
        if (!this.parent || !this.prop) {
            return false;
        }
        switch (this.prop.kind) {
            case core_1.ReferenceKind.ONE_TO_MANY: return true;
            case core_1.ReferenceKind.MANY_TO_MANY: return true;
            case core_1.ReferenceKind.ONE_TO_ONE: return !this.prop.owner;
            default: return false; // SCALAR, MANY_TO_ONE
        }
    }
}
exports.ScalarCriteriaNode = ScalarCriteriaNode;
