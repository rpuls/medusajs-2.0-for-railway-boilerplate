"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderChangeType = exports.OrderChangeStatus = void 0;
var OrderChangeStatus;
(function (OrderChangeStatus) {
    /**
     * The order change is confirmed.
     */
    OrderChangeStatus["CONFIRMED"] = "confirmed";
    /**
     * The order change is declined.
     */
    OrderChangeStatus["DECLINED"] = "declined";
    /**
     * The order change is requested.
     */
    OrderChangeStatus["REQUESTED"] = "requested";
    /**
     * The order change is pending.
     */
    OrderChangeStatus["PENDING"] = "pending";
    /**
     * The order change is canceled.
     */
    OrderChangeStatus["CANCELED"] = "canceled";
})(OrderChangeStatus || (exports.OrderChangeStatus = OrderChangeStatus = {}));
var OrderChangeType;
(function (OrderChangeType) {
    OrderChangeType["RETURN_REQUEST"] = "return_request";
    OrderChangeType["RETURN_RECEIVE"] = "return_receive";
    OrderChangeType["EXCHANGE"] = "exchange";
    OrderChangeType["CLAIM"] = "claim";
    OrderChangeType["EDIT"] = "edit";
    OrderChangeType["CREDIT_LINE"] = "credit_line";
})(OrderChangeType || (exports.OrderChangeType = OrderChangeType = {}));
//# sourceMappingURL=order-change.js.map