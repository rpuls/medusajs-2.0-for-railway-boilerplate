"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwIfOrderIsCancelled = throwIfOrderIsCancelled;
exports.throwIfItemsDoesNotExistsInOrder = throwIfItemsDoesNotExistsInOrder;
exports.throwIfItemsAreNotGroupedByShippingRequirement = throwIfItemsAreNotGroupedByShippingRequirement;
exports.throwIfIsCancelled = throwIfIsCancelled;
exports.throwIfOrderChangeIsNotActive = throwIfOrderChangeIsNotActive;
exports.throwIfItemsDoesNotExistsInReturn = throwIfItemsDoesNotExistsInReturn;
const utils_1 = require("@medusajs/framework/utils");
function throwIfOrderIsCancelled({ order }) {
    if (order.status === utils_1.OrderStatus.CANCELED) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Order with id ${order.id} has been canceled.`);
    }
}
function throwIfItemsDoesNotExistsInOrder({ order, inputItems, }) {
    const orderItemIds = order.items?.map((i) => i.id) ?? [];
    const inputItemIds = inputItems?.map((i) => i.id);
    const diff = (0, utils_1.arrayDifference)(inputItemIds, orderItemIds);
    if (diff.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Items with ids ${diff.join(", ")} does not exist in order with id ${order.id}.`);
    }
}
function throwIfItemsAreNotGroupedByShippingRequirement({ order, inputItems, }) {
    const itemsWithShipping = [];
    const itemsWithoutShipping = [];
    const orderItemsMap = new Map((order.items || []).map((item) => [item.id, item]));
    for (const inputItem of inputItems) {
        const orderItem = orderItemsMap.get(inputItem.id);
        if (orderItem.requires_shipping) {
            itemsWithShipping.push(orderItem.id);
        }
        else {
            itemsWithoutShipping.push(orderItem.id);
        }
    }
    if (itemsWithShipping.length && itemsWithoutShipping.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Fulfillment can only be created entirely with items with shipping or items without shipping. Split this request into 2 fulfillments.`);
    }
}
function throwIfIsCancelled(obj, type) {
    if (obj.canceled_at) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `${type} with id ${obj.id} has been canceled.`);
    }
}
function throwIfOrderChangeIsNotActive({ orderChange, }) {
    if (!(0, utils_1.isPresent)(orderChange)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `An active Order Change is required to proceed`);
    }
    if (orderChange.canceled_at ||
        orderChange.confirmed_at ||
        orderChange.declined_at) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Order change ${orderChange?.id} is not active to be modified`);
    }
}
function throwIfItemsDoesNotExistsInReturn({ orderReturn, inputItems, }) {
    const orderReturnItemIds = orderReturn.items?.map((i) => i.item_id) ?? [];
    const inputItemIds = inputItems.map((i) => i.id);
    const diff = (0, utils_1.arrayDifference)(inputItemIds, orderReturnItemIds);
    if (diff.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Items with ids ${diff.join(", ")} does not exist in Return with id ${orderReturn.id}.`);
    }
}
//# sourceMappingURL=order-validation.js.map