"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const calculate_order_change_1 = require("../calculate-order-change");
const set_action_reference_1 = require("../set-action-reference");
calculate_order_change_1.OrderChangeProcessing.registerActionType(utils_1.ChangeActionType.SHIP_ITEM, {
    operation({ action, currentOrder, options }) {
        const existing = currentOrder.items.find((item) => item.id === action.details.reference_id);
        existing.detail.shipped_quantity ??= 0;
        existing.detail.shipped_quantity = utils_1.MathBN.add(existing.detail.shipped_quantity, action.details.quantity);
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
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Quantity to ship of item ${refId} is required.`);
        }
        if (utils_1.MathBN.lt(action.details?.quantity, 1)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Quantity of item ${refId} must be greater than 0.`);
        }
        const notShipped = utils_1.MathBN.sub(existing.detail?.fulfilled_quantity, existing.detail?.shipped_quantity);
        const greater = utils_1.MathBN.gt(action.details?.quantity, notShipped);
        if (greater) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot ship more items than what was fulfilled for item ${refId}.`);
        }
    },
});
//# sourceMappingURL=ship-item.js.map