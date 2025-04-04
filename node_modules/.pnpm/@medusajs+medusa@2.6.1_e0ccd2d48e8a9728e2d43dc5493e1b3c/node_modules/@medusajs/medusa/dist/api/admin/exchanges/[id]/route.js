"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const http_1 = require("@medusajs/framework/http");
const GET = async (req, res) => {
    const exchange = await (0, http_1.refetchEntity)("order_exchange", req.params.id, req.scope, req.queryConfig.fields);
    if (!exchange) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Exchange with id: ${req.params.id} was not found`);
    }
    res.status(200).json({ exchange });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map