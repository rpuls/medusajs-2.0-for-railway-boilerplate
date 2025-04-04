"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayCriteriaNode = void 0;
const CriteriaNode_1 = require("./CriteriaNode");
/**
 * @internal
 */
class ArrayCriteriaNode extends CriteriaNode_1.CriteriaNode {
    process(qb, options) {
        return this.payload.map((node) => {
            return node.process(qb, options);
        });
    }
    unwrap() {
        return this.payload.map((node) => {
            return node.unwrap();
        });
    }
    willAutoJoin(qb, alias, options) {
        return this.payload.some((node) => {
            return node.willAutoJoin(qb, alias, options);
        });
    }
}
exports.ArrayCriteriaNode = ArrayCriteriaNode;
