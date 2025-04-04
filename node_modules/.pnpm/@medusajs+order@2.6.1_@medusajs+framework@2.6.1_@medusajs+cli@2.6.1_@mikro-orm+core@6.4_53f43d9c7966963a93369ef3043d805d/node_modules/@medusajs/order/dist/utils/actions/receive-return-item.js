"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const calculate_order_change_1 = require("../calculate-order-change");
const set_action_reference_1 = require("../set-action-reference");
calculate_order_change_1.OrderChangeProcessing.registerActionType(utils_1.ChangeActionType.RECEIVE_RETURN_ITEM, {
    isDeduction: true,
    operation({ action, currentOrder, previousEvents, options }) {
        const existing = currentOrder.items.find((item) => item.id === action.details.reference_id);
        let toReturn = action.details.quantity;
        existing.detail.return_received_quantity ??= 0;
        existing.detail.return_requested_quantity ??= 0;
        existing.detail.return_received_quantity = utils_1.MathBN.add(existing.detail.return_received_quantity, toReturn);
        existing.detail.return_requested_quantity = utils_1.MathBN.sub(existing.detail.return_requested_quantity, toReturn);
        (0, set_action_reference_1.setActionReference)(existing, action, options);
        return utils_1.MathBN.mult(existing.unit_price, action.details.quantity);
    },
    validate({ action, currentOrder }) {
        const refId = action.details?.reference_id;
        if (refId == null) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Details reference ID is required.");
        }
        const existing = currentOrder.items.find((item) => item.id === refId);
        if (!existing) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Item ID "${refId}" not found.`);
        }
        if (!action.details?.quantity) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Quantity to receive return of item ${refId} is required.`);
        }
        const quantityRequested = existing?.detail?.return_requested_quantity || 0;
        const greater = utils_1.MathBN.gt(action.details?.quantity, quantityRequested);
        if (greater) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot receive more items than what was requested to be returned for item ${refId}.`);
        }
    },
});
//# sourceMappingURL=receive-return-item.js.map