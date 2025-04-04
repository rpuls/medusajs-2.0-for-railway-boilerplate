"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRemoteQueryStep = exports.useRemoteQueryStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.useRemoteQueryStepId = "use-remote-query";
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
exports.useRemoteQueryStep = (0, workflows_sdk_1.createStep)(exports.useRemoteQueryStepId, async (data, { container }) => {
    const { list = true, fields, variables } = data;
    const query = container.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const isUsingEntryPoint = "entry_point" in data;
    const queryObjectConfig = {
        fields,
        variables,
        entryPoint: isUsingEntryPoint ? data.entry_point : undefined,
        service: !isUsingEntryPoint ? data.service : undefined,
    };
    const config = {
        throwIfKeyNotFound: !!data.throw_if_key_not_found,
        throwIfRelationNotFound: data.throw_if_key_not_found
            ? data.throw_if_relation_not_found
            : undefined,
    };
    const entities = await query(queryObjectConfig, config);
    const result = list ? entities : entities[0];
    return new workflows_sdk_1.StepResponse(result);
});
//# sourceMappingURL=use-remote-query.js.map