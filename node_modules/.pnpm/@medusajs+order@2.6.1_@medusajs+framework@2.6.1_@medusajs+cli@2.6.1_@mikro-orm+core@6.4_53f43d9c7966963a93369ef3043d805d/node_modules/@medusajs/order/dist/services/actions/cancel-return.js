"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelReturn = cancelReturn;
const utils_1 = require("@medusajs/framework/utils");
async function createOrderChange(service, data, returnRef, actions, sharedContext) {
    return await service.createOrderChange_({
        order_id: returnRef.order_id,
        return_id: returnRef.id,
        reference: "return",
        reference_id: returnRef.id,
        description: data.description,
        internal_note: data.internal_note,
        created_by: data.created_by,
        metadata: data.metadata,
        actions,
    }, sharedContext);
}
async function cancelReturn(data, sharedContext) {
    const returnOrder = (await this.retrieveReturn(data.return_id, {
        select: [
            "id",
            "order_id",
            "items.item_id",
            "items.quantity",
            "items.received_quantity",
        ],
        relations: ["items", "shipping_methods"],
    }, sharedContext));
    const actions = [];
    returnOrder.items.forEach((item) => {
        actions.push({
            action: utils_1.ChangeActionType.CANCEL_RETURN_ITEM,
            order_id: returnOrder.order_id,
            return_id: returnOrder.id,
            reference: "return",
            reference_id: returnOrder.id,
            details: {
                reference_id: item.item_id,
                quantity: item.quantity,
            },
        });
    });
    returnOrder.shipping_methods?.forEach((shipping) => {
        actions.push({
            action: utils_1.ChangeActionType.SHIPPING_REMOVE,
            order_id: returnOrder.order_id,
            return_id: returnOrder.id,
            reference: "return",
            reference_id: shipping.id,
            amount: shipping.raw_amount ?? shipping.amount,
        });
    });
    const [change] = await createOrderChange(this, data, returnOrder, actions, sharedContext);
    await (0, utils_1.promiseAll)([
        this.updateReturns([
            {
                data: {
                    canceled_at: new Date(),
                },
                selector: {
                    id: returnOrder.id,
                },
            },
        ], sharedContext),
        this.confirmOrderChange(change.id, sharedContext),
    ]);
    return returnOrder;
}
//# sourceMappingURL=cancel-return.js.map