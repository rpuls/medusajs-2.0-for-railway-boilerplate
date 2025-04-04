"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelExchange = cancelExchange;
const utils_1 = require("@medusajs/framework/utils");
async function createOrderChange(service, data, exchangeOrder, actions, sharedContext) {
    return await service.createOrderChange_({
        order_id: exchangeOrder.order_id,
        exchange_id: exchangeOrder.id,
        reference: "exchange",
        reference_id: exchangeOrder.id,
        description: data.description,
        internal_note: data.internal_note,
        created_by: data.created_by,
        metadata: data.metadata,
        actions,
    }, sharedContext);
}
async function cancelExchange(data, sharedContext) {
    const exchangeOrder = (await this.retrieveOrderExchange(data.exchange_id, {
        select: [
            "id",
            "order_id",
            "additional_items.id",
            "additional_items.item_id",
            "additional_items.quantity",
        ],
        relations: ["additional_items", "shipping_methods"],
    }, sharedContext));
    const actions = [];
    exchangeOrder.additional_items.forEach((item) => {
        actions.push({
            action: utils_1.ChangeActionType.ITEM_REMOVE,
            order_id: exchangeOrder.order_id,
            exchange_id: exchangeOrder.id,
            reference: "exchange",
            reference_id: exchangeOrder.id,
            details: {
                order_id: exchangeOrder.order_id,
                reference_id: item.item_id,
                exchange_id: exchangeOrder.id,
                quantity: item.quantity,
            },
        });
    });
    exchangeOrder.shipping_methods?.forEach((shipping) => {
        actions.push({
            action: utils_1.ChangeActionType.SHIPPING_REMOVE,
            order_id: exchangeOrder.order_id,
            exchange_id: exchangeOrder.id,
            reference: "exchange",
            reference_id: shipping.id,
            amount: shipping.raw_amount ?? shipping.amount,
        });
    });
    const [change] = await createOrderChange(this, data, exchangeOrder, actions, sharedContext);
    await (0, utils_1.promiseAll)([
        this.updateOrderExchanges([
            {
                data: {
                    canceled_at: new Date(),
                },
                selector: {
                    id: exchangeOrder.id,
                },
            },
        ], sharedContext),
        this.confirmOrderChange(change.id, sharedContext),
    ]);
    return exchangeOrder;
}
//# sourceMappingURL=cancel-exchange.js.map