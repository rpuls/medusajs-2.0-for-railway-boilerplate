"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoZone = void 0;
const utils_1 = require("@medusajs/framework/utils");
const service_zone_1 = require("./service-zone");
exports.GeoZone = utils_1.model
    .define("geo_zone", {
    id: utils_1.model.id({ prefix: "fgz" }).primaryKey(),
    type: utils_1.model.enum(utils_1.GeoZoneType).default(utils_1.GeoZoneType.COUNTRY),
    country_code: utils_1.model.text(),
    province_code: utils_1.model.text().nullable(),
    city: utils_1.model.text().nullable(),
    postal_expression: utils_1.model.json().nullable(),
    service_zone: utils_1.model.belongsTo(() => service_zone_1.ServiceZone, {
        mappedBy: "geo_zones",
    }),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        on: ["country_code"],
        where: "deleted_at IS NULL",
    },
    {
        on: ["province_code"],
        where: "deleted_at IS NULL",
    },
    {
        on: ["city"],
        where: "deleted_at IS NULL",
    },
]);
//# sourceMappingURL=geo-zone.js.map