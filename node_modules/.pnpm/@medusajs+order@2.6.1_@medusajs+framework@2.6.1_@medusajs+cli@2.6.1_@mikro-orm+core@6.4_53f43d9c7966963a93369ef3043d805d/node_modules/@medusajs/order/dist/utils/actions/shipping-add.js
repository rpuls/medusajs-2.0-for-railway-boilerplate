"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const calculate_order_change_1 = require("../calculate-order-change");
const set_action_reference_1 = require("../set-action-reference");
calculate_order_change_1.OrderChangeProcessing.registerActionType(utils_1.ChangeActionType.SHIPPING_ADD, {
    operation({ action, currentOrder, options }) {
        const shipping = Array.isArray(currentOrder.shipping_methods)
            ? currentOrder.shipping_methods
            : [currentOrder.shipping_methods];
        let existing = shipping.find((sh) => sh.id === action.reference_id);
        if (!existing) {
            existing = {
                id: action.reference_id,
                order_id: currentOrder.id,
                return_id: action.return_id,
                claim_id: action.claim_id,
                exchange_id: action.exchange_id,
                amount: action.amount,
            };
            shipping.push(existing);
        }
        (0, set_action_reference_1.setActionReference)(existing, action, options);
        currentOrder.shipping_methods = shipping;
    },
    validate({ action }) {
        if (!action.reference_id) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Reference ID is required.");
        }
        if (action.amount == null) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Amount is required.");
        }
    },
});
//# sourceMappingURL=shipping-add.js.map