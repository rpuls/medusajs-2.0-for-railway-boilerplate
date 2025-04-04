"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClaimReason = exports.ClaimType = exports.ReturnStatus = exports.OrderStatus = void 0;
/**
 * @enum
 *
 * The order's status.
 */
var OrderStatus;
(function (OrderStatus) {
    /**
     * The order is pending.
     */
    OrderStatus["PENDING"] = "pending";
    /**
     * The order is completed
     */
    OrderStatus["COMPLETED"] = "completed";
    /**
     * The order is a draft.
     */
    OrderStatus["DRAFT"] = "draft";
    /**
     * The order is archived.
     */
    OrderStatus["ARCHIVED"] = "archived";
    /**
     * The order is canceled.
     */
    OrderStatus["CANCELED"] = "canceled";
    /**
     * The order requires action.
     */
    OrderStatus["REQUIRES_ACTION"] = "requires_action";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
/**
 * @enum
 *
 * The return's status.
 */
var ReturnStatus;
(function (ReturnStatus) {
    /**
     * The return is open.
     */
    ReturnStatus["OPEN"] = "open";
    /**
     * The return is requested.
     */
    ReturnStatus["REQUESTED"] = "requested";
    /**
     * The return is received.
     */
    ReturnStatus["RECEIVED"] = "received";
    /**
     * The return is partially received.
     */
    ReturnStatus["PARTIALLY_RECEIVED"] = "partially_received";
    /**
     * The return is canceled.
     */
    ReturnStatus["CANCELED"] = "canceled";
})(ReturnStatus || (exports.ReturnStatus = ReturnStatus = {}));
/**
 * @enum
 *
 * The claim's type.
 */
var ClaimType;
(function (ClaimType) {
    /**
     * The claim refunds an amount to the customer.
     */
    ClaimType["REFUND"] = "refund";
    /**
     * The claim replaces the returned item with a new one.
     */
    ClaimType["REPLACE"] = "replace";
})(ClaimType || (exports.ClaimType = ClaimType = {}));
/**
 * @enum
 *
 * The claim's item reason.
 */
var ClaimReason;
(function (ClaimReason) {
    ClaimReason["MISSING_ITEM"] = "missing_item";
    ClaimReason["WRONG_ITEM"] = "wrong_item";
    ClaimReason["PRODUCTION_FAILURE"] = "production_failure";
    ClaimReason["OTHER"] = "other";
})(ClaimReason || (exports.ClaimReason = ClaimReason = {}));
//# sourceMappingURL=status.js.map