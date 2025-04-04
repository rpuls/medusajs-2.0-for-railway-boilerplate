"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data } = await query.graph({
        entity: "product_tag",
        filters: {
            id: req.params.id,
        },
        fields: req.queryConfig.fields,
    });
    if (!data.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Product tag with id: ${req.params.id} was not found`);
    }
    res.json({ product_tag: data[0] });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map