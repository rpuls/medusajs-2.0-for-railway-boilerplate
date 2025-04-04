/**
 * The remote query's details.
 */
export interface RemoteStepInput {
    /**
     * The fields to retrieve in the records.
     */
    fields: string[];
    /**
     * Filters, context variables, or pagination fields to apply when retrieving the records.
     */
    variables?: Record<string, any>;
    /**
     * Throw an error if a record isn't found matching an ID specified in the filters.
     */
    throw_if_key_not_found?: boolean;
    /**
     * Throw an error if a specified relation isn't found.
     */
    throw_if_relation_not_found?: boolean | string[];
    /**
     * Whether to retrieve the records as an array. If disabled, only one record is retrieved as an object.
     *
     * @defaultValue true
     */
    list?: boolean;
}
export interface EntryStepInput extends RemoteStepInput {
    /**
     * The name of the data model to retrieve its records.
     */
    entry_point: string;
}
export interface ServiceStepInput extends RemoteStepInput {
    /**
     * The name of the module's service.
     */
    service: string;
}
export declare const useRemoteQueryStepId = "use-remote-query";
/**
 * This step fetches data across modules using the remote query.
 *
 * Learn more in the [Remote Query documentation](https://docs.medusajs.com/learn/fundamentals/module-links/query).
 *
 * :::note
 *
 * This step is deprecated. Use {@link useQueryGraphStep} instead.
 *
 * :::
 *
 * @example
 *
 * To retrieve a list of records of a data model:
 *
 * ```ts
 * const products = useRemoteQueryStep({
 *   entry_point: "product",
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
 * const product = useRemoteQueryStep({
 *   entry_point: "product",
 *   fields: [
 *     "*",
 *     "variants.*"
 *   ],
 *   variables: {
 *     filters: {
 *       id: "123"
 *     }
 *   },
 *   list: false
 * })
 * ```
 *
 * To throw an error if a record isn't found matching the specified ID:
 *
 * ```ts
 * const product = useRemoteQueryStep({
 *   entry_point: "product",
 *   fields: [
 *     "*",
 *     "variants.*"
 *   ],
 *   variables: {
 *     filters: {
 *       id: "123"
 *     }
 *   },
 *   list: false,
 *   throw_if_key_not_found: true
 * })
 * ```
 */
export declare const useRemoteQueryStep: import("@medusajs/framework/workflows-sdk").StepFunction<EntryStepInput | ServiceStepInput, any>;
//# sourceMappingURL=use-remote-query.d.ts.map