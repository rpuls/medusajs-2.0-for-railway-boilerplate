"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const Locking = utils_1.model.define("Locking", {
    id: utils_1.model.id({ prefix: "lk" }).primaryKey(),
    owner_id: utils_1.model.text().nullable(),
    expiration: utils_1.model.dateTime().nullable(),
});
exports.default = Locking;
//# sourceMappingURL=locking.js.map