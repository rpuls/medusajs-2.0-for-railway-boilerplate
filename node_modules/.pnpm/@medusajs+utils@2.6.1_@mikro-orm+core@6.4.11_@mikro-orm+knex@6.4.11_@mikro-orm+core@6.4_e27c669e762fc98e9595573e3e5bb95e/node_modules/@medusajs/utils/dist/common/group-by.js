"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupBy = groupBy;
function groupBy(array, attribute) {
    return array.reduce((map, obj) => {
        const key = obj[attribute];
        if (!key) {
            return map;
        }
        if (!map.get(key)) {
            map.set(key, []);
        }
        map.get(key).push(obj);
        return map;
    }, new Map());
}
//# sourceMappingURL=group-by.js.map