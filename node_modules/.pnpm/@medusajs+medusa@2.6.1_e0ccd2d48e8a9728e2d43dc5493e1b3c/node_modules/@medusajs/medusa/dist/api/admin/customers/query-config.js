"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAddressesTransformQueryConfig = exports.retrieveAddressTransformQueryConfig = exports.defaultAdminCustomerAddressFields = exports.listTransformQueryConfig = exports.retrieveTransformQueryConfig = exports.allowed = exports.defaultAdminCustomerFields = void 0;
exports.defaultAdminCustomerFields = [
    "id",
    "company_name",
    "first_name",
    "last_name",
    "email",
    "phone",
    "metadata",
    "has_account",
    "created_by",
    "created_at",
    "updated_at",
    "deleted_at",
];
exports.allowed = [
    "id",
    "company_name",
    "first_name",
    "last_name",
    "email",
    "phone",
    "metadata",
    "has_account",
    "created_by",
    "created_at",
    "updated_at",
    "deleted_at",
    "addresses",
    "groups",
];
exports.retrieveTransformQueryConfig = {
    defaults: exports.defaultAdminCustomerFields,
    allowed: exports.allowed,
    isList: false,
};
exports.listTransformQueryConfig = {
    ...exports.retrieveTransformQueryConfig,
    isList: true,
};
exports.defaultAdminCustomerAddressFields = [
    "id",
    "company",
    "customer_id",
    "first_name",
    "last_name",
    "address_1",
    "address_2",
    "city",
    "province",
    "postal_code",
    "country_code",
    "phone",
    "metadata",
    "created_at",
    "updated_at",
];
exports.retrieveAddressTransformQueryConfig = {
    defaults: exports.defaultAdminCustomerAddressFields,
    isList: false,
};
exports.listAddressesTransformQueryConfig = {
    ...exports.retrieveAddressTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map