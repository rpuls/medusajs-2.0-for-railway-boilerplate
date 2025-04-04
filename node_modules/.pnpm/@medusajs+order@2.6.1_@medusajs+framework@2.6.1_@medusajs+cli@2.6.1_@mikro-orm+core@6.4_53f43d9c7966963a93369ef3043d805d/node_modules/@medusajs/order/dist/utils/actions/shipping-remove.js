"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const calculate_order_change_1 = require("../calculate-order-change");
calculate_order_change_1.OrderChangeProcessing.registerActionType(utils_1.ChangeActionType.SHIPPING_REMOVE, {
    operation({ action, currentOrder, options }) {
        const shipping = Array.isArray(currentOrder.shipping_methods)
            ? currentOrder.shipping_methods
            : [currentOrder.shipping_methods];
        const existingIndex = shipping.findIndex((item) => item.id === action.reference_id);
        if (existingIndex > -1) {
            shipping.splice(existingIndex, 1);
        }
        currentOrder.shipping_methods = shipping;
    },
    validate({ action }) {
        if (!action.reference_id) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Reference ID is required.");
        }
    },
});
//# sourceMappingURL=shipping-remove.js.map