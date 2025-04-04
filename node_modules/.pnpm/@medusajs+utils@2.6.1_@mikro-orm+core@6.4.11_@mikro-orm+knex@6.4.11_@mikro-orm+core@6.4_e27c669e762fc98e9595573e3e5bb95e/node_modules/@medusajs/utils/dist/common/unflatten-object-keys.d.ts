/**
 * unFlatten object keys
 * @example
 * input: {
 *   "variants.sku": { $like: "%-1" },
 *   "variants.prices.amount": { $gt: 30 },
 *   "variants.prices.currency": "USD"
 * }
 *
 * output: {
 *   {
 *       "variants": {
 *         "sku": {
 *           "$like": "%-1"
 *         },
 *         "prices": {
 *           "amount": {
 *             "$gt": 30
 *           },
 *           "currency": "USD"
 *         }
 *       }
 *     }
 * }
 *
 * @param input
 */
export declare function unflattenObjectKeys(flattened: Record<string, any>): Record<string, any>;
//# sourceMappingURL=unflatten-object-keys.d.ts.map