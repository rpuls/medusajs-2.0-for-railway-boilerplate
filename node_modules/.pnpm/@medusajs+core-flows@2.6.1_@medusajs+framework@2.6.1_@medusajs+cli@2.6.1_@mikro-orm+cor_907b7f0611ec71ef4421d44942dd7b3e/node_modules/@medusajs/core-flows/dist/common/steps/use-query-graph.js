"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQueryGraphStep = void 0;
const workflows_sdk_1 = require("@medusajs/workflows-sdk");
const utils_1 = require("@medusajs/utils");
const useQueryGraphStepId = "use-query-graph-step";
const step = (0, workflows_sdk_1.createStep)(useQueryGraphStepId, async (input, { container }) => {
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { options, ...queryConfig } = input;
    const result = await query.graph(queryConfig, options);
    return new workflows_sdk_1.StepResponse(result);
});
/**
 * This step fetches data across modules using the Query.
 *
 * Learn more in the [Query documentation](https://docs.medusajs.com/learn/fundamentals/module-links/query).
 *
 * @example
 * To retrieve a list of records of a data model:
 *
 * ```ts
 * const { data: products } = useQueryGraphStep({
 *   entity: "product",
 *   fields: [
 *     "*",
 *     "variants.*"
 *   ]
 * })
 * ```
 *
 * To retrieve a single item instead of a an array:
 *
 * ```ts
 * const { data: products } = useQueryGraphStep({
 *   entity: "product",
 *   fields: [
 *     "*",
 *     "variants.*"
 *   ],
 *   filters: {
 *     id: "123"
 *   }
 * })
 * ```
 *
 * To throw an error if a record isn't found matching the specified ID:
 *
 * ```ts
 * const { data: products } = useQueryGraphStep({
 *   entity: "product",
 *   fields: [
 *     "*",
 *     "variants.*"
 *   ],
 *   filters: {
 *     id: "123"
 *   },
 *   options: {
 *     throwIfKeyNotFound: true
 *   }
 * })
 * ```
 *
 * To set pagination configurations:
 *
 * ```ts
 * const { data: products } = useQueryGraphStep({
 *   entity: "product",
 *   fields: [
 *     "*",
 *     "variants.*"
 *   ],
 *   filters: {
 *     id: "123"
 *   },
 *   pagination: {
 *     take: 10,
 *     skip: 10,
 *     order: {
 *       created_at: "DESC"
 *     }
 *   }
 * })
 * ```
 */
const useQueryGraphStep = (input) => step(input);
exports.useQueryGraphStep = useQueryGraphStep;
//# sourceMappingURL=use-query-graph.js.map