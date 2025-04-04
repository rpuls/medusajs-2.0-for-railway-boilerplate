"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data: product_types, metadata } = await query.graph({
        entity: "product_type",
        filters: req.filterableFields,
        pagination: req.queryConfig.pagination,
        fields: req.queryConfig.fields,
    });
    res.json({
        product_types,
        count: metadata?.count ?? 0,
        offset: metadata?.skip ?? 0,
        limit: metadata?.take ?? 0,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map