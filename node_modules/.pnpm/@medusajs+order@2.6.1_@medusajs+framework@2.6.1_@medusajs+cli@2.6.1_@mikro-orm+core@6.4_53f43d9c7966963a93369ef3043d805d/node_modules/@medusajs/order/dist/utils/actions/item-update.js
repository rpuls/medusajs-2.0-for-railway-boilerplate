"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const calculate_order_change_1 = require("../calculate-order-change");
const set_action_reference_1 = require("../set-action-reference");
calculate_order_change_1.OrderChangeProcessing.registerActionType(utils_1.ChangeActionType.ITEM_UPDATE, {
    operation({ action, currentOrder, options }) {
        const existingIndex = currentOrder.items.findIndex((item) => item.id === action.details.reference_id);
        const existing = currentOrder.items[existingIndex];
        const originalQuantity = utils_1.MathBN.convert(existing.detail.quantity ?? existing.quantity);
        const originalUnitPrice = utils_1.MathBN.convert(existing.detail.unit_price ?? existing.unit_price);
        const currentQuantity = utils_1.MathBN.convert(action.details.quantity);
        const quantityDiff = utils_1.MathBN.sub(currentQuantity, originalQuantity);
        existing.quantity = currentQuantity;
        existing.detail.quantity = currentQuantity;
        if (action.details.unit_price) {
            const currentUnitPrice = utils_1.MathBN.convert(action.details.unit_price);
            const originalTotal = utils_1.MathBN.mult(originalUnitPrice, originalQuantity);
            const currentTotal = utils_1.MathBN.mult(currentUnitPrice, currentQuantity);
            existing.unit_price = currentUnitPrice;
            existing.detail.unit_price = currentUnitPrice;
            (0, set_action_reference_1.setActionReference)(existing, action, options);
            return utils_1.MathBN.sub(currentTotal, originalTotal);
        }
        (0, set_action_reference_1.setActionReference)(existing, action, options);
        return utils_1.MathBN.mult(existing.unit_price, quantityDiff);
    },
    validate({ action, currentOrder }) {
        const refId = action.details?.reference_id;
        if (refId == null) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Reference ID is required.");
        }
        const existing = currentOrder.items.find((item) => item.id === refId);
        if (!existing) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Item ID "${refId}" not found.`);
        }
        if (action.details?.quantity == null) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Quantity of item ${refId} is required.`);
        }
        action.details.quantity ??= 0;
        const lower = utils_1.MathBN.lt(action.details.quantity, existing.detail?.fulfilled_quantity);
        if (lower) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Item ${refId} has already been fulfilled and quantity cannot be lower than ${existing.detail?.fulfilled_quantity}.`);
        }
    },
});
//# sourceMappingURL=item-update.js.map