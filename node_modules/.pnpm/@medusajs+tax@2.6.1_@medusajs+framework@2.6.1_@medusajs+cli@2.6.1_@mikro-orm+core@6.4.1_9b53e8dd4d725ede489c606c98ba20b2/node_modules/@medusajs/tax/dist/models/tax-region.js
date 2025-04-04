"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxRegionCountryTopLevelCheckName = exports.taxRegionProviderTopLevelCheckName = void 0;
const utils_1 = require("@medusajs/framework/utils");
const tax_provider_1 = __importDefault(require("./tax-provider"));
const tax_rate_1 = __importDefault(require("./tax-rate"));
exports.taxRegionProviderTopLevelCheckName = "CK_tax_region_provider_top_level";
exports.taxRegionCountryTopLevelCheckName = "CK_tax_region_country_top_level";
const TaxRegion = utils_1.model
    .define("TaxRegion", {
    id: utils_1.model.id({ prefix: "txreg" }).primaryKey(),
    country_code: utils_1.model.text().searchable(),
    province_code: utils_1.model.text().searchable().nullable(),
    metadata: utils_1.model.json().nullable(),
    created_by: utils_1.model.text().nullable(),
    provider: utils_1.model
        .belongsTo(() => tax_provider_1.default, {
        mappedBy: "regions",
    })
        .nullable(),
    parent: utils_1.model
        .belongsTo(() => TaxRegion, {
        mappedBy: "children",
    })
        .nullable(),
    children: utils_1.model.hasMany(() => TaxRegion, {
        mappedBy: "parent",
    }),
    tax_rates: utils_1.model.hasMany(() => tax_rate_1.default, {
        mappedBy: "tax_region",
    }),
})
    .checks([
    {
        name: exports.taxRegionProviderTopLevelCheckName,
        expression: `parent_id IS NULL OR provider_id IS NULL`,
    },
    {
        name: exports.taxRegionCountryTopLevelCheckName,
        expression: `parent_id IS NULL OR province_code IS NOT NULL`,
    },
])
    .indexes([
    {
        name: "IDX_tax_region_unique_country_province",
        on: ["country_code", "province_code"],
        unique: true,
        where: "deleted_at IS NULL",
    },
    {
        name: "IDX_tax_region_unique_country_nullable_province",
        on: ["country_code"],
        unique: true,
        where: "province_code IS NULL AND deleted_at IS NULL",
    },
])
    .cascades({
    delete: ["children", "tax_rates"],
});
exports.default = TaxRegion;
//# sourceMappingURL=tax-region.js.map