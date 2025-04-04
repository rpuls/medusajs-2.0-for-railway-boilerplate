"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const helpers_1 = require("../helpers");
const GET = async (req, res) => {
    const payment = await (0, helpers_1.refetchPayment)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ payment });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map