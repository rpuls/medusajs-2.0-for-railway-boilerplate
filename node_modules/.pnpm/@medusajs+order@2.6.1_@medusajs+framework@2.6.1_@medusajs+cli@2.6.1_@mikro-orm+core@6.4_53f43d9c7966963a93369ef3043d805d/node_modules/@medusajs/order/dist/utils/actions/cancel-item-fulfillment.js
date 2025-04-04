"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const calculate_order_change_1 = require("../calculate-order-change");
const set_action_reference_1 = require("../set-action-reference");
calculate_order_change_1.OrderChangeProcessing.registerActionType(utils_1.ChangeActionType.CANCEL_ITEM_FULFILLMENT, {
    operation({ action, currentOrder, options }) {
        const existing = currentOrder.items.find((item) => item.id === action.details.reference_id);
        existing.detail.fulfilled_quantity ??= 0;
        existing.detail.fulfilled_quantity = utils_1.MathBN.sub(existing.detail.fulfilled_quantity, action.details.quantity);
        (0, set_action_reference_1.setActionReference)(existing, action, options);
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
        if (!action.details?.quantity) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Quantity to cancel item fulfillment ${refId} is required.`);
        }
        if (action.details?.quantity < 1) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Quantity to cancel item ${refId} must be greater than 0.`);
        }
        const greater = utils_1.MathBN.gt(action.details?.quantity, existing.detail?.fulfilled_quantity);
        if (greater) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot cancel more items than what was fulfilled for item ${refId}.`);
        }
    },
});
//# sourceMappingURL=cancel-item-fulfillment.js.map