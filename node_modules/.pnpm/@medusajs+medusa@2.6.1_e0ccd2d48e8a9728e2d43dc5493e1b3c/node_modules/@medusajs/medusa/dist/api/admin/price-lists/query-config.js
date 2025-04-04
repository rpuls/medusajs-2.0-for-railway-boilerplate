"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPriceListQueryConfig = exports.retrivePriceListQueryConfig = exports.listPriceListPriceQueryConfig = exports.retrivePriceListPriceQueryConfig = exports.adminPriceListRemoteQueryFields = exports.adminPriceListPriceRemoteQueryFields = exports.PriceListRelations = void 0;
var PriceListRelations;
(function (PriceListRelations) {
    PriceListRelations["PRICES"] = "prices";
})(PriceListRelations || (exports.PriceListRelations = PriceListRelations = {}));
exports.adminPriceListPriceRemoteQueryFields = [
    "id",
    "currency_code",
    "amount",
    "min_quantity",
    "max_quantity",
    "created_at",
    "deleted_at",
    "updated_at",
    "price_set.variant.id",
    "price_rules.value",
    "price_rules.attribute",
];
exports.adminPriceListRemoteQueryFields = [
    "id",
    "type",
    "description",
    "title",
    "status",
    "starts_at",
    "ends_at",
    "created_at",
    "updated_at",
    "deleted_at",
    "price_list_rules.value",
    "price_list_rules.attribute",
    ...exports.adminPriceListPriceRemoteQueryFields.map((field) => `prices.${field}`),
];
exports.retrivePriceListPriceQueryConfig = {
    defaults: exports.adminPriceListPriceRemoteQueryFields,
    isList: false,
};
exports.listPriceListPriceQueryConfig = {
    ...exports.retrivePriceListPriceQueryConfig,
    isList: true,
};
exports.retrivePriceListQueryConfig = {
    defaults: exports.adminPriceListRemoteQueryFields,
    isList: false,
};
exports.listPriceListQueryConfig = {
    ...exports.retrivePriceListQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map