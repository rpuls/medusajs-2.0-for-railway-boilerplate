"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeActionType = void 0;
var ChangeActionType;
(function (ChangeActionType) {
    ChangeActionType["FULFILL_ITEM"] = "FULFILL_ITEM";
    ChangeActionType["DELIVER_ITEM"] = "DELIVER_ITEM";
    ChangeActionType["CANCEL_ITEM_FULFILLMENT"] = "CANCEL_ITEM_FULFILLMENT";
    ChangeActionType["ITEM_ADD"] = "ITEM_ADD";
    ChangeActionType["ITEM_REMOVE"] = "ITEM_REMOVE";
    ChangeActionType["ITEM_UPDATE"] = "ITEM_UPDATE";
    ChangeActionType["RECEIVE_DAMAGED_RETURN_ITEM"] = "RECEIVE_DAMAGED_RETURN_ITEM";
    ChangeActionType["RECEIVE_RETURN_ITEM"] = "RECEIVE_RETURN_ITEM";
    ChangeActionType["RETURN_ITEM"] = "RETURN_ITEM";
    ChangeActionType["CANCEL_RETURN_ITEM"] = "CANCEL_RETURN_ITEM";
    ChangeActionType["SHIPPING_ADD"] = "SHIPPING_ADD";
    ChangeActionType["SHIPPING_REMOVE"] = "SHIPPING_REMOVE";
    ChangeActionType["SHIP_ITEM"] = "SHIP_ITEM";
    ChangeActionType["WRITE_OFF_ITEM"] = "WRITE_OFF_ITEM";
    ChangeActionType["REINSTATE_ITEM"] = "REINSTATE_ITEM";
    ChangeActionType["TRANSFER_CUSTOMER"] = "TRANSFER_CUSTOMER";
    ChangeActionType["UPDATE_ORDER_PROPERTIES"] = "UPDATE_ORDER_PROPERTIES";
    ChangeActionType["CREDIT_LINE_ADD"] = "CREDIT_LINE_ADD";
})(ChangeActionType || (exports.ChangeActionType = ChangeActionType = {}));
//# sourceMappingURL=order-change-action.js.map