/**
 * Flatten object keys
 * @example
 * input: {
 *   a: 1,
 *   b: {
 *     c: 2,
 *     d: 3,
 *   },
 *   e: 4,
 * }
 *
 * output: {
 *   a: 1,
 *   b.c: 2,
 *   b.d: 3,
 *   e: 4,
 * }
 *
 * @param input
 */
export declare function flattenObjectKeys(input: Record<string, any>): Record<string, any>;
//# sourceMappingURL=flatten-object-keys.d.ts.map