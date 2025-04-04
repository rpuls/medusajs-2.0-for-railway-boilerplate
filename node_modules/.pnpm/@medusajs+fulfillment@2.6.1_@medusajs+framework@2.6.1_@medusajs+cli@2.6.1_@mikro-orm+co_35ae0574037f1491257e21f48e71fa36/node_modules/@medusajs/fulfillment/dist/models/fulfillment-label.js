"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentLabel = void 0;
const utils_1 = require("@medusajs/framework/utils");
const fulfillment_1 = require("./fulfillment");
exports.FulfillmentLabel = utils_1.model.define("fulfillment_label", {
    id: utils_1.model.id({ prefix: "fulla" }).primaryKey(),
    tracking_number: utils_1.model.text(),
    tracking_url: utils_1.model.text(),
    label_url: utils_1.model.text(),
    fulfillment: utils_1.model.belongsTo(() => fulfillment_1.Fulfillment, {
        mappedBy: "labels",
    }),
});
//# sourceMappingURL=fulfillment-label.js.map