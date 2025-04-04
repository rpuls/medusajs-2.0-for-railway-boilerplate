"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const calculate_order_change_1 = require("../calculate-order-change");
const set_action_reference_1 = require("../set-action-reference");
calculate_order_change_1.OrderChangeProcessing.registerActionType(utils_1.ChangeActionType.ITEM_ADD, {
    operation({ action, currentOrder, options }) {
        let existing = currentOrder.items.find((item) => item.id === action.details.reference_id);
        if (existing) {
            existing.detail.quantity ??= 0;
            existing.quantity = utils_1.MathBN.add(existing.quantity, action.details.quantity);
            existing.detail.quantity = utils_1.MathBN.add(existing.detail.quantity, action.details.quantity);
        }
        else {
            existing = {
                id: action.details.reference_id,
                order_id: currentOrder.id,
                return_id: action.return_id,
                claim_id: action.claim_id,
                exchange_id: action.exchange_id,
                unit_price: action.details.unit_price,
                compare_at_unit_price: action.details.compare_at_unit_price,
                quantity: action.details.quantity,
            };
            currentOrder.items.push(existing);
        }
        (0, set_action_reference_1.setActionReference)(existing, action, options);
        return utils_1.MathBN.mult(action.details.unit_price, action.details.quantity);
    },
    validate({ action }) {
        const refId = action.details?.reference_id;
        if (action.amount == null && action.details?.unit_price == null) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Unit price of item ${refId} is required if no action.amount is provided.`);
        }
        if (!action.details?.quantity) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Quantity of item ${refId} is required.`);
        }
        if (utils_1.MathBN.lt(action.details?.quantity, 1)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Quantity of item ${refId} must be greater than 0.`);
        }
    },
});
//# sourceMappingURL=item-add.js.map