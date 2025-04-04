"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const calculate_order_change_1 = require("../calculate-order-change");
const set_action_reference_1 = require("../set-action-reference");
calculate_order_change_1.OrderChangeProcessing.registerActionType(utils_1.ChangeActionType.UPDATE_ORDER_PROPERTIES, {
    operation({ action, currentOrder, options }) {
        /**
         * NOOP: used as a reference for the change
         */
        (0, set_action_reference_1.setActionReference)(currentOrder, action, options);
    },
    validate({ action }) {
        /* noop */
    },
});
//# sourceMappingURL=change-shipping-address.js.map