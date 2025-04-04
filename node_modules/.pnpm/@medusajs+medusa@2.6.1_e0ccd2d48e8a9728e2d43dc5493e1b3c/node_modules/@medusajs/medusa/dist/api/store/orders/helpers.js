"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchOrder = void 0;
const http_1 = require("@medusajs/framework/http");
const refetchOrder = async (idOrFilter, scope, fields) => {
    return await (0, http_1.refetchEntity)("order", idOrFilter, scope, fields);
};
exports.refetchOrder = refetchOrder;
//# sourceMappingURL=helpers.js.map