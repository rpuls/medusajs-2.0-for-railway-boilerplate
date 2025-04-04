"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require(".");
const TaxProvider = utils_1.model.define("TaxProvider", {
    id: utils_1.model.id().primaryKey(),
    is_enabled: utils_1.model.boolean().default(true),
    regions: utils_1.model.hasMany(() => _models_1.TaxRegion, {
        mappedBy: "provider",
    }),
});
exports.default = TaxProvider;
//# sourceMappingURL=tax-provider.js.map