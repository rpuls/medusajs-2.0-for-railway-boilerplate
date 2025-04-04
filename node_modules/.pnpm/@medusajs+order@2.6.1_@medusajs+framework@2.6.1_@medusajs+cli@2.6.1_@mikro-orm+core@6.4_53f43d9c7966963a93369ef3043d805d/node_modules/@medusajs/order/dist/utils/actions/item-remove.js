"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const calculate_order_change_1 = require("../calculate-order-change");
const set_action_reference_1 = require("../set-action-reference");
calculate_order_change_1.OrderChangeProcessing.registerActionType(utils_1.ChangeActionType.ITEM_REMOVE, {
    isDeduction: true,
    operation({ action, currentOrder, options }) {
        const existingIndex = currentOrder.items.findIndex((item) => item.id === action.details.reference_id);
        const existing = currentOrder.items[existingIndex];
        existing.detail.quantity ??= 0;
        existing.quantity = utils_1.MathBN.sub(existing.quantity, action.details.quantity);
        existing.detail.quantity = utils_1.MathBN.sub(existing.detail.quantity, action.details.quantity);
        (0, set_action_reference_1.setActionReference)(existing, action, options);
        return utils_1.MathBN.mult(existing.unit_price, action.details.quantity);
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
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Quantity of item ${refId} is required.`);
        }
        if (utils_1.MathBN.lt(action.details?.quantity, 1)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Quantity of item ${refId} must be greater than 0.`);
        }
        const notFulfilled = utils_1.MathBN.sub(existing.quantity, existing.detail?.fulfilled_quantity);
        const greater = utils_1.MathBN.gt(action.details?.quantity, notFulfilled);
        if (greater) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot remove fulfilled item: Item ${refId}.`);
        }
    },
});
//# sourceMappingURL=item-remove.js.map