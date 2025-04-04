"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const calculate_order_change_1 = require("../calculate-order-change");
const set_action_reference_1 = require("../set-action-reference");
calculate_order_change_1.OrderChangeProcessing.registerActionType(utils_1.ChangeActionType.DELIVER_ITEM, {
    operation({ action, currentOrder, options }) {
        const item = currentOrder.items.find((item) => item.id === action.details.reference_id);
        item.detail.delivered_quantity ??= 0;
        item.detail.delivered_quantity = utils_1.MathBN.add(item.detail.delivered_quantity, action.details.quantity);
        (0, set_action_reference_1.setActionReference)(item, action, options);
    },
    validate({ action, currentOrder }) {
        const refId = action.details?.reference_id;
        if (refId == null) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Reference ID is required.");
        }
        const item = currentOrder.items.find((item) => item.id === refId);
        if (!item) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Item ID "${refId}" not found.`);
        }
        const totalDeliverable = utils_1.MathBN.convert(item.quantity);
        const totalDelivered = utils_1.MathBN.convert(item.detail?.delivered_quantity);
        const newDelivered = utils_1.MathBN.convert(action.details?.quantity ?? 0);
        const newTotalDelivered = utils_1.MathBN.sum(totalDelivered, newDelivered);
        const totalFulfilled = utils_1.MathBN.convert(item.detail?.fulfilled_quantity);
        if (utils_1.MathBN.lte(newDelivered, 0)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Quantity of item ${refId} must be greater than 0.`);
        }
        if (utils_1.MathBN.gt(newTotalDelivered, totalFulfilled)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot deliver more items than what was fulfilled for item ${refId}.`);
        }
        if (utils_1.MathBN.gt(newTotalDelivered, totalDeliverable)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot deliver more items than what was ordered for item ${refId}.`);
        }
    },
});
//# sourceMappingURL=deliver-item.js.map