"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSetDifference = getSetDifference;
/**
 * Get the difference between two sets. The difference is the elements that are in the original set but not in the compare set.
 * @param orignalSet
 * @param compareSet
 */
function getSetDifference(orignalSet, compareSet) {
    const difference = new Set();
    orignalSet.forEach((element) => {
        if (!compareSet.has(element)) {
            difference.add(element);
        }
    });
    return difference;
}
//# sourceMappingURL=get-set-difference.js.map