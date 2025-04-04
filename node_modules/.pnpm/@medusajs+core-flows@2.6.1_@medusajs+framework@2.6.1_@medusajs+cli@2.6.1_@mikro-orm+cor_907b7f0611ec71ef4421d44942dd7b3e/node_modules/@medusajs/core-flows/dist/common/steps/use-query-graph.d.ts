import { GraphResultSet, RemoteJoinerOptions, RemoteQueryInput } from "@medusajs/framework/types";
import { StepFunction } from "@medusajs/workflows-sdk";
export type UseQueryGraphStepInput<TEntry extends string> = RemoteQueryInput<TEntry> & {
    options?: RemoteJoinerOptions;
};
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
export declare const useQueryGraphStep: <const TEntry extends string>(input: UseQueryGraphStepInput<TEntry>) => ReturnType<StepFunction<UseQueryGraphStepInput<TEntry>, GraphResultSet<TEntry>>>;
//# sourceMappingURL=use-query-graph.d.ts.map