"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentItem = void 0;
const utils_1 = require("@medusajs/framework/utils");
const fulfillment_1 = require("./fulfillment");
exports.FulfillmentItem = utils_1.model
    .define("fulfillment_item", {
    id: utils_1.model.id({ prefix: "fulit" }).primaryKey(),
    title: utils_1.model.text(),
    sku: utils_1.model.text(),
    barcode: utils_1.model.text(),
    quantity: utils_1.model.bigNumber(),
    line_item_id: utils_1.model.text().nullable(),
    inventory_item_id: utils_1.model.text().nullable(),
    fulfillment: utils_1.model.belongsTo(() => fulfillment_1.Fulfillment, {
        mappedBy: "items",
    }),
})
    .indexes([
    {
        on: ["inventory_item_id"],
        where: "deleted_at IS NULL",
    },
    {
        on: ["line_item_id"],
        where: "deleted_at IS NULL",
    },
]);
//# sourceMappingURL=fulfillment-item.js.map