"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAddressesTransformQueryConfig = exports.retrieveAddressTransformQueryConfig = exports.defaultStoreCustomerAddressFields = exports.retrieveTransformQueryConfig = void 0;
const defaultStoreCustomersFields = [
    "id",
    "email",
    "company_name",
    "first_name",
    "last_name",
    "phone",
    "metadata",
    "has_account",
    "deleted_at",
    "created_at",
    "updated_at",
    "*addresses",
];
exports.retrieveTransformQueryConfig = {
    defaults: defaultStoreCustomersFields,
    allowed: [
        ...defaultStoreCustomersFields.map((f) => f.replace("*", "")),
        "orders",
    ],
    isList: false,
};
exports.defaultStoreCustomerAddressFields = [
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
    "is_default_shipping",
    "is_default_billing",
    "created_at",
    "updated_at",
];
exports.retrieveAddressTransformQueryConfig = {
    defaults: exports.defaultStoreCustomerAddressFields,
    isList: false,
};
exports.listAddressesTransformQueryConfig = {
    ...exports.retrieveAddressTransformQueryConfig,
    isList: true,
};
//# sourceMappingURL=query-config.js.map