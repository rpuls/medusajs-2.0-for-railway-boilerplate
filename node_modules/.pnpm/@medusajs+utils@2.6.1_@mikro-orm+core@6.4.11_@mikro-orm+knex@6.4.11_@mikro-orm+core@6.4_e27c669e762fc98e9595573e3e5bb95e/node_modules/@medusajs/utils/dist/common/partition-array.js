"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partitionArray = void 0;
/**
 * Partitions an array into two arrays based on a predicate function

 * @example
 * const result = partitionArray([1, 2, 3, 4, 5], (x) => x % 2 === 0)
 *
 * console.log(result)
 *
 * // output: [[2, 4], [1, 3, 5]]
 *
 * @param {T} input input array of type T
 * @param {(T) => boolean} predicate function to use when split array elements
 */
const partitionArray = (input, predicate) => {
    return input.reduce(([pos, neg], currentElement) => {
        if (predicate(currentElement)) {
            pos.push(currentElement);
        }
        else {
            neg.push(currentElement);
        }
        return [pos, neg];
    }, [[], []]);
};
exports.partitionArray = partitionArray;
//# sourceMappingURL=partition-array.js.map