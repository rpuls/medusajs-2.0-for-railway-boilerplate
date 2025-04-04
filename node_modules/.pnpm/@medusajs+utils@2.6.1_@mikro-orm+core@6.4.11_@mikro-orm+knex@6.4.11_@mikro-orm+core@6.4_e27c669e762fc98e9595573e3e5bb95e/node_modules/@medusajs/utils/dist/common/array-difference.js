"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayDifference = arrayDifference;
function arrayDifference(mainArray, differingArray) {
    const mainArraySet = new Set(mainArray);
    const differingArraySet = new Set(differingArray);
    const difference = [...mainArraySet].filter((element) => !differingArraySet.has(element));
    return difference;
}
//# sourceMappingURL=array-difference.js.map