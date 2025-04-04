"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.defaultAdminReservationFields = void 0;
const query_config_1 = require("../inventory-items/query-config");
exports.defaultAdminReservationFields = [
    "id",
    "location_id",
    "inventory_item_id",
    "quantity",
    "line_item_id",
    "description",
    "metadata",
    "created_at",
    "updated_at",
    ...query_config_1.defaultAdminInventoryItemFields.map((f) => `inventory_item.${f}`),
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminReservationFields,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map