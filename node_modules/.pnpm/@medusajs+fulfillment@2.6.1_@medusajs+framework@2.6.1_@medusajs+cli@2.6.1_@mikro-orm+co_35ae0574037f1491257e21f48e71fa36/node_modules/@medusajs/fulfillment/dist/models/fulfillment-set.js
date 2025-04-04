"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentSet = void 0;
const utils_1 = require("@medusajs/framework/utils");
const service_zone_1 = require("./service-zone");
exports.FulfillmentSet = utils_1.model
    .define("fulfillment_set", {
    id: utils_1.model.id({ prefix: "fuset" }).primaryKey(),
    name: utils_1.model.text(),
    type: utils_1.model.text(),
    service_zones: utils_1.model.hasMany(() => service_zone_1.ServiceZone, {
        mappedBy: "fulfillment_set",
    }),
    metadata: utils_1.model.json().nullable(),
})
    .indexes([
    {
        on: ["name"],
        where: "deleted_at IS NULL",
        unique: true,
    },
])
    .cascades({
    delete: ["service_zones"],
});
//# sourceMappingURL=fulfillment-set.js.map