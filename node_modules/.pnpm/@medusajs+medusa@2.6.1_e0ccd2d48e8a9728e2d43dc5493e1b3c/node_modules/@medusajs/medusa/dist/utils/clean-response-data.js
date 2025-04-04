"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanResponseData = cleanResponseData;
const utils_1 = require("@medusajs/framework/utils");
// TODO: once the legacy totals decoration will be removed.
// We will be able to only compute the totals if one of the total fields is present
// and therefore avoid totals computation if the user don't want them to appear in the response
// and therefore the below const will be removed
const INCLUDED_FIELDS = [
    "shipping_total",
    "discount_total",
    "tax_total",
    "refunded_total",
    "total",
    "subtotal",
    "paid_total",
    "refundable_amount",
    "gift_card_total",
    "gift_card_tax_total",
    "item_tax_total",
    "shipping_tax_total",
    "refundable",
    "original_total",
    "original_tax_total",
];
const EXCLUDED_FIELDS = ["raw_discount_total"];
/**
 * Filter response data to contain props specified in the `allowedProperties`.
 * You can read more in the transformQuery middleware utility methods.
 *
 * @param data - record or an array of records in the response
 * @param fields - record props allowed in the response
 */
function cleanResponseData(data, fields) {
    fields = fields ?? [];
    const isDataArray = Array.isArray(data);
    let arrayData = isDataArray ? data : [data];
    if (!fields.length) {
        arrayData = arrayData.map((record) => (0, utils_1.omitDeep)(record, EXCLUDED_FIELDS));
        return (isDataArray ? arrayData : arrayData[0]);
    }
    const fieldsSet = new Set([...fields, ...INCLUDED_FIELDS]);
    fields = [...fieldsSet];
    arrayData = arrayData.map((record) => {
        return (0, utils_1.pickDeep)((0, utils_1.omitDeep)(record, EXCLUDED_FIELDS), fields);
    });
    return (isDataArray ? arrayData : arrayData[0]);
}
//# sourceMappingURL=clean-response-data.js.map