"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const http_1 = require("@medusajs/framework/http");
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const claim = await (0, http_1.refetchEntity)("order_claim", req.params.id, req.scope, req.queryConfig.fields);
    if (!claim) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Claim with id: ${req.params.id} was not found`);
    }
    res.status(200).json({ claim });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map