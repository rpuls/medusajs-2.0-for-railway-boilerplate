"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminCreateShipment = exports.AdminCreateFulfillment = exports.AdminFulfillmentParams = void 0;
const zod_1 = require("zod");
const common_validators_1 = require("../../utils/common-validators");
const validators_1 = require("../../utils/validators");
exports.AdminFulfillmentParams = (0, validators_1.createSelectParams)();
const AdminCreateFulfillmentItem = zod_1.z.object({
    title: zod_1.z.string(),
    sku: zod_1.z.string(),
    quantity: zod_1.z.number(),
    barcode: zod_1.z.string(),
    line_item_id: zod_1.z.string().nullish(),
    inventory_item_id: zod_1.z.string().nullish(),
});
const AdminCreateFulfillmentLabel = zod_1.z.object({
    tracking_number: zod_1.z.string(),
    tracking_url: zod_1.z.string(),
    label_url: zod_1.z.string(),
});
// TODO: revisit the data shape this endpoint accepts
exports.AdminCreateFulfillment = zod_1.z.object({
    location_id: zod_1.z.string(),
    provider_id: zod_1.z.string(),
    delivery_address: common_validators_1.AddressPayload,
    items: zod_1.z.array(AdminCreateFulfillmentItem),
    labels: zod_1.z.array(AdminCreateFulfillmentLabel),
    order_id: zod_1.z.string(),
    shipping_option_id: zod_1.z.string().nullish(),
    data: zod_1.z.record(zod_1.z.unknown()).nullable(),
    packed_at: zod_1.z.coerce.date().nullish(),
    shipped_at: zod_1.z.coerce.date().nullish(),
    delivered_at: zod_1.z.coerce.date().nullish(),
    canceled_at: zod_1.z.coerce.date().nullish(),
    metadata: zod_1.z.record(zod_1.z.unknown()).nullable(),
});
exports.AdminCreateShipment = zod_1.z.object({
    labels: zod_1.z.array(AdminCreateFulfillmentLabel),
});
//# sourceMappingURL=validators.js.map