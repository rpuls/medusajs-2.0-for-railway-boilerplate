"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const http_1 = require("@medusajs/framework/http");
const GET = async (req, res) => {
    const category = await (0, http_1.refetchEntity)("product_category", { id: req.params.id, ...req.filterableFields }, req.scope, req.queryConfig.fields);
    if (!category) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Product category with id: ${req.params.id} was not found`);
    }
    res.json({ product_category: category });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map