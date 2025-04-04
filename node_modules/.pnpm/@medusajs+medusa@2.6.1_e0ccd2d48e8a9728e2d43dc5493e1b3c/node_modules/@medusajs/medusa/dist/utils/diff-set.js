"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSetDifference = getSetDifference;
function getSetDifference(orignalSet, compareSet) {
    const difference = new Set();
    orignalSet.forEach((element) => {
        if (!compareSet.has(element)) {
            difference.add(element);
        }
    });
    return difference;
}
//# sourceMappingURL=diff-set.js.map