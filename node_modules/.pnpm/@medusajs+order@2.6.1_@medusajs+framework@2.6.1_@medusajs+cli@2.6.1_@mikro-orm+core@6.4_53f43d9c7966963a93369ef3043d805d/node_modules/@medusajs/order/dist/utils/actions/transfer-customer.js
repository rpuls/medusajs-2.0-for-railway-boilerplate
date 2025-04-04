"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const calculate_order_change_1 = require("../calculate-order-change");
const set_action_reference_1 = require("../set-action-reference");
calculate_order_change_1.OrderChangeProcessing.registerActionType(utils_1.ChangeActionType.TRANSFER_CUSTOMER, {
    operation({ action, currentOrder, options }) {
        currentOrder.customer_id = action.reference_id;
        (0, set_action_reference_1.setActionReference)(currentOrder, action, options);
    },
    validate({ action }) {
        if (!action.reference_id) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Reference to customer ID is required");
        }
    },
});
//# sourceMappingURL=transfer-customer.js.map