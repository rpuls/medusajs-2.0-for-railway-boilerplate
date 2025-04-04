"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchEntity = exports.refetchEntities = void 0;
const utils_1 = require("@medusajs/utils");
const refetchEntities = async (entryPoint, idOrFilter, scope, fields, pagination) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const filters = (0, utils_1.isString)(idOrFilter) ? { id: idOrFilter } : idOrFilter;
    let context = {};
    if ("context" in filters) {
        if (filters.context) {
            context = filters.context;
        }
        delete filters.context;
    }
    const variables = { filters, ...context, ...pagination };
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint,
        variables,
        fields,
    });
    return await remoteQuery(queryObject);
};
exports.refetchEntities = refetchEntities;
const refetchEntity = async (entryPoint, idOrFilter, scope, fields) => {
    const [entity] = await (0, exports.refetchEntities)(entryPoint, idOrFilter, scope, fields);
    return entity;
};
exports.refetchEntity = refetchEntity;
//# sourceMappingURL=refetch-entities.js.map