"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordRequest = void 0;
const zod_1 = require("zod");
exports.ResetPasswordRequest = zod_1.z.object({
    identifier: zod_1.z.string(),
});
//# sourceMappingURL=validators.js.map