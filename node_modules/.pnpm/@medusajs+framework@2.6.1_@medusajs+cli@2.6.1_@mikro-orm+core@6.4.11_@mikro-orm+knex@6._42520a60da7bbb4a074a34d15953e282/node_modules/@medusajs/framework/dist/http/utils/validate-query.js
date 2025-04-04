"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndTransformQuery = validateAndTransformQuery;
const utils_1 = require("@medusajs/utils");
const lodash_1 = require("lodash");
const zod_helpers_1 = require("../../zod/zod-helpers");
const get_query_config_1 = require("./get-query-config");
/**
 * Normalize an input query, especially from array like query params to an array type
 * e.g: /admin/orders/?fields[]=id,status,cart_id becomes { fields: ["id", "status", "cart_id"] }
 *
 * We only support up to 2 levels of depth for query params in order to have a somewhat readable query param, and limit possible performance issues
 */
const normalizeQuery = (req) => {
    return Object.entries(req.query).reduce((acc, [key, val]) => {
        let normalizedValue = val;
        if (Array.isArray(val) && val.length === 1 && typeof val[0] === "string") {
            normalizedValue = val[0].split(",");
        }
        if (key.includes(".")) {
            const [parent, child, ...others] = key.split(".");
            if (others.length > 0) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_ARGUMENT, `Key accessor more than 2 levels deep: ${key}`);
            }
            if (!acc[parent]) {
                acc[parent] = {};
            }
            acc[parent] = {
                ...acc[parent],
                [child]: normalizedValue,
            };
        }
        else {
            acc[key] = normalizedValue;
        }
        return acc;
    }, {});
};
/**
 * Omit the non filterable config from the validated object
 * @param obj
 */
const getFilterableFields = (obj) => {
    const result = (0, lodash_1.omit)(obj, ["limit", "offset", "fields", "order"]);
    return (0, utils_1.removeUndefinedProperties)(result);
};
function validateAndTransformQuery(zodSchema, queryConfig) {
    return async function validateQuery(req, _, next) {
        try {
            const restricted = req.restrictedFields?.list();
            const allowed = queryConfig.allowed ?? [];
            // If any custom allowed fields are set, we add them to the allowed list along side the one configured in the query config if any
            if (req.allowed?.length) {
                allowed.push(...req.allowed);
            }
            delete req.allowed;
            const query = normalizeQuery(req);
            const validated = await (0, zod_helpers_1.zodValidator)(zodSchema, query);
            const cnf = queryConfig.isList
                ? (0, get_query_config_1.prepareListQuery)(validated, { ...queryConfig, allowed, restricted })
                : (0, get_query_config_1.prepareRetrieveQuery)(validated, {
                    ...queryConfig,
                    allowed,
                    restricted,
                });
            req.validatedQuery = validated;
            req.filterableFields = getFilterableFields(req.validatedQuery);
            req.queryConfig = cnf.remoteQueryConfig;
            req.remoteQueryConfig = req.queryConfig;
            req.listConfig = cnf.listConfig;
            req.retrieveConfig = cnf.retrieveConfig;
            next();
        }
        catch (e) {
            next(e);
        }
    };
}
//# sourceMappingURL=validate-query.js.map