"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeApplyLinkFilter = maybeApplyLinkFilter;
const utils_1 = require("@medusajs/utils");
function maybeApplyLinkFilter({ entryPoint, resourceId, filterableField, filterByField = "id", }) {
    return async function linkFilter(req, _, next) {
        const filterableFields = req.filterableFields;
        if (!filterableFields?.[filterableField]) {
            return next();
        }
        const filterFields = filterableFields[filterableField];
        const idsToFilterBy = Array.isArray(filterFields)
            ? filterFields
            : [filterFields];
        delete filterableFields[filterableField];
        const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
        const queryObject = (0, utils_1.remoteQueryObjectFromString)({
            entryPoint,
            fields: [resourceId],
            variables: { filters: { [filterableField]: idsToFilterBy } },
        });
        const resources = await remoteQuery(queryObject);
        let existingFilters = filterableFields[filterByField];
        if (existingFilters) {
            if (typeof existingFilters === "string") {
                existingFilters = [existingFilters];
            }
            filterableFields[filterByField] = (0, utils_1.arrayIntersection)(existingFilters, resources.map((p) => p[resourceId]));
        }
        else {
            filterableFields[filterByField] = resources.map((p) => p[resourceId]);
        }
        req.filterableFields = transformFilterableFields(filterableFields);
        return next();
    };
}
/*
  Transforms an object key string into nested objects
  before = {
    "test.something.another": []
  }

  after = {
    test: {
      something: {
        another: []
      }
    }
  }
*/
function transformFilterableFields(filterableFields) {
    const result = {};
    for (const key of Object.keys(filterableFields)) {
        const value = filterableFields[key];
        const keys = key.split(".");
        let current = result;
        // Iterate over the keys, creating nested objects as needed
        for (let i = 0; i < keys.length; i++) {
            const part = keys[i];
            current[part] ??= {};
            if (i === keys.length - 1) {
                // If its the last key, assign the value
                current[part] = value;
                break;
            }
            current = current[part];
        }
    }
    return result;
}
//# sourceMappingURL=maybe-apply-link-filter.js.map