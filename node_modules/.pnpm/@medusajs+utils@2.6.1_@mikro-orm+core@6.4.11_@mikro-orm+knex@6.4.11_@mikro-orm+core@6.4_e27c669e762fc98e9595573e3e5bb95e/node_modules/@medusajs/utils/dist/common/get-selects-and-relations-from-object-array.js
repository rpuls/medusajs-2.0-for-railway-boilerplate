"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelectsAndRelationsFromObjectArray = getSelectsAndRelationsFromObjectArray;
const deduplicate_1 = require("./deduplicate");
const is_object_1 = require("./is-object");
const KEYS_THAT_ARE_NOT_RELATIONS = ["metadata"];
function getSelectsAndRelationsFromObjectArray(dataArray, options = {
    objectFields: [],
}, prefix) {
    const selects = [];
    const relations = [];
    for (const data of dataArray) {
        for (const [key, value] of Object.entries(data)) {
            if ((0, is_object_1.isObject)(value) && !options.objectFields.includes(key)) {
                const res = getSelectsAndRelationsFromObjectArray([value], options, setKey(key, prefix));
                selects.push(...res.selects);
                if (!KEYS_THAT_ARE_NOT_RELATIONS.includes(key)) {
                    relations.push(setKey(key, prefix));
                    relations.push(...res.relations);
                }
            }
            else if (Array.isArray(value)) {
                const res = getSelectsAndRelationsFromObjectArray(value, options, setKey(key, prefix));
                selects.push(...res.selects);
                if (!KEYS_THAT_ARE_NOT_RELATIONS.includes(key)) {
                    relations.push(setKey(key, prefix));
                    relations.push(...res.relations);
                }
            }
            else {
                selects.push(setKey(key, prefix));
            }
        }
    }
    const uniqueSelects = (0, deduplicate_1.deduplicate)(selects);
    const uniqueRelations = (0, deduplicate_1.deduplicate)(relations);
    return {
        selects: uniqueSelects,
        relations: uniqueRelations,
    };
}
function setKey(key, prefix) {
    if (prefix) {
        return `${prefix}.${key}`;
    }
    else {
        return key;
    }
}
//# sourceMappingURL=get-selects-and-relations-from-object-array.js.map