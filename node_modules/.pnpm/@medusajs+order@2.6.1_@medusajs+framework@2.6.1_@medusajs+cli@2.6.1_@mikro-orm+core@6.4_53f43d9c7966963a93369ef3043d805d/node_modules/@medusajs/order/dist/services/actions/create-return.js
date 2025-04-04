"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReturn = createReturn;
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../../models");
function createReturnReference(em, data, order) {
    return em.create((0, utils_1.toMikroORMEntity)(_models_1.Return), {
        order_id: data.order_id,
        order_version: order.version,
        status: utils_1.ReturnStatus.REQUESTED,
        no_notification: data.no_notification,
        refund_amount: data.refund_amount ?? null,
    });
}
function createReturnItems(em, data, returnRef, actions) {
    return data.items.map((item) => {
        actions.push({
            action: utils_1.ChangeActionType.RETURN_ITEM,
            return_id: returnRef.id,
            internal_note: item.internal_note,
            reference: "return",
            reference_id: returnRef.id,
            details: {
                reference_id: item.id,
                quantity: item.quantity,
                metadata: item.metadata,
            },
        });
        return em.create((0, utils_1.toMikroORMEntity)(_models_1.ReturnItem), {
            reason_id: item.reason_id,
            return_id: returnRef.id,
            item_id: item.id,
            quantity: item.quantity,
            note: item.note,
            metadata: item.metadata,
        });
    });
}
async function processShippingMethod(service, data, returnRef, actions, sharedContext) {
    let shippingMethodId;
    if (!(0, utils_1.isDefined)(data.shipping_method)) {
        return;
    }
    if (!(0, utils_1.isString)(data.shipping_method)) {
        const methods = await service.createOrderShippingMethods([
            {
                ...data.shipping_method,
                order_id: data.order_id,
                return_id: returnRef.id,
            },
        ], sharedContext);
        shippingMethodId = methods[0].id;
    }
    else {
        shippingMethodId = data.shipping_method;
    }
    const method = await service.retrieveOrderShippingMethod(shippingMethodId, { relations: ["tax_lines", "adjustments"] }, sharedContext);
    const calculatedAmount = (0, utils_1.getShippingMethodsTotals)([method], {})[method.id];
    if (shippingMethodId) {
        actions.push({
            action: utils_1.ChangeActionType.SHIPPING_ADD,
            reference: "order_shipping_method",
            reference_id: shippingMethodId,
            amount: calculatedAmount.total,
            details: {
                order_id: returnRef.order_id,
                return_id: returnRef.id,
            },
        });
    }
}
async function createOrderChange(service, data, returnRef, actions, sharedContext) {
    return await service.createOrderChange_({
        order_id: data.order_id,
        return_id: returnRef.id,
        change_type: utils_1.OrderChangeType.RETURN_REQUEST,
        reference: "return",
        reference_id: returnRef.id,
        description: data.description,
        internal_note: data.internal_note,
        created_by: data.created_by,
        metadata: data.metadata,
        actions,
    }, sharedContext);
}
async function createReturn(data, sharedContext) {
    const order = await this.orderService_.retrieve(data.order_id, { relations: ["items"] }, sharedContext);
    const em = sharedContext.transactionManager;
    const returnRef = createReturnReference(em, data, order);
    const actions = [];
    returnRef.items = createReturnItems(em, data, returnRef, actions);
    await processShippingMethod(this, data, returnRef, actions, sharedContext);
    const change = await createOrderChange(this, data, returnRef, actions, sharedContext);
    await (0, utils_1.promiseAll)([
        this.createReturns([returnRef], sharedContext),
        this.confirmOrderChange(change[0].id, sharedContext),
    ]);
    return returnRef;
}
//# sourceMappingURL=create-return.js.map