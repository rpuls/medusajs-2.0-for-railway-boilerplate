"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayIntersection = arrayIntersection;
function arrayIntersection(firstArray, secondArray) {
    const firstArraySet = new Set(firstArray);
    const res = new Set();
    secondArray.forEach((element) => {
        if (firstArraySet.has(element)) {
            res.add(element);
        }
    });
    return Array.from(res);
}
//# sourceMappingURL=array-intersection.js.map