"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCategoryFilters = exports.refetchCategory = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchCategory = async (categoryId, scope, fields, filterableFields = {}) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "product_category",
        variables: {
            filters: { ...filterableFields, id: categoryId },
        },
        fields: fields,
    });
    const categories = await remoteQuery(queryObject);
    return categories[0];
};
exports.refetchCategory = refetchCategory;
const applyCategoryFilters = (req, res, next) => {
    if (!req.filterableFields) {
        req.filterableFields = {};
    }
    req.filterableFields = {
        ...req.filterableFields,
        is_active: true,
        is_internal: false,
    };
    next();
};
exports.applyCategoryFilters = applyCategoryFilters;
//# sourceMappingURL=helpers.js.map