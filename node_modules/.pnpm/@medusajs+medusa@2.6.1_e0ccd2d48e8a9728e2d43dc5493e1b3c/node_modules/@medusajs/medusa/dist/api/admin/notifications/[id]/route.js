"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const http_1 = require("@medusajs/framework/http");
const GET = async (req, res) => {
    const notification = await (0, http_1.refetchEntity)("notification", req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ notification });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map