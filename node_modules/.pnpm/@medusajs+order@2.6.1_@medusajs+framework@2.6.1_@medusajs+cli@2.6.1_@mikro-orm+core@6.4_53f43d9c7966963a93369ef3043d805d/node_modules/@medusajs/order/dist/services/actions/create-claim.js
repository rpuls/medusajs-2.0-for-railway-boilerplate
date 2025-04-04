"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClaim = createClaim;
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../../models");
function createClaimAndReturnEntities(em, data, order) {
    const claimReference = em.create((0, utils_1.toMikroORMEntity)(_models_1.OrderClaim), {
        order_id: data.order_id,
        order_version: order.version,
        type: data.type,
        no_notification: data.no_notification,
        refund_amount: data.refund_amount ?? null,
    });
    const returnReference = data.type === utils_1.ClaimType.REPLACE
        ? em.create((0, utils_1.toMikroORMEntity)(_models_1.Return), {
            order_id: data.order_id,
            order_version: order.version,
            status: utils_1.ReturnStatus.REQUESTED,
            claim: claimReference.id,
            refund_amount: data.refund_amount ?? null,
        })
        : undefined;
    claimReference.return = returnReference?.id;
    return { claimReference, returnReference };
}
function createReturnItem(em, item, claimReference, returnReference, actions) {
    actions.push({
        action: utils_1.ChangeActionType.RETURN_ITEM,
        reference: "return",
        reference_id: returnReference.id,
        details: {
            reference_id: item.id,
            quantity: item.quantity,
            metadata: item.metadata,
        },
    });
    return em.create((0, utils_1.toMikroORMEntity)(_models_1.ReturnItem), {
        item_id: item.id,
        return_id: returnReference.id,
        quantity: item.quantity,
        note: item.note,
        metadata: item.metadata,
    });
}
function createClaimAndReturnItems(em, data, claimReference, returnReference, actions) {
    const returnItems = [];
    const claimItems = data.claim_items?.map((item) => {
        actions.push({
            action: utils_1.ChangeActionType.WRITE_OFF_ITEM,
            reference: "claim",
            reference_id: claimReference.id,
            details: {
                reference_id: item.id,
                quantity: item.quantity,
                metadata: item.metadata,
            },
        });
        returnItems.push(returnReference
            ? createReturnItem(em, item, claimReference, returnReference, actions)
            : undefined);
        return em.create((0, utils_1.toMikroORMEntity)(_models_1.OrderClaimItem), {
            item_id: item.id,
            reason: item.reason,
            quantity: item.quantity,
            note: item.note,
            metadata: item.metadata,
        });
    });
    return [claimItems, returnItems];
}
async function processAdditionalItems(em, service, data, order, claimReference, actions, sharedContext) {
    const itemsToAdd = [];
    const additionalNewItems = [];
    const additionalItems = [];
    data.additional_items?.forEach((item) => {
        const hasItem = item.id
            ? order.items.find((o) => o.item.id === item.id)
            : false;
        if (hasItem) {
            actions.push({
                action: utils_1.ChangeActionType.ITEM_ADD,
                claim_id: claimReference.id,
                internal_note: item.internal_note,
                reference: "claim",
                reference_id: claimReference.id,
                details: {
                    reference_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.unit_price ?? hasItem.item.unit_price,
                    metadata: item.metadata,
                },
            });
            additionalItems.push(em.create((0, utils_1.toMikroORMEntity)(_models_1.OrderClaimItem), {
                item_id: item.id,
                quantity: item.quantity,
                note: item.note,
                metadata: item.metadata,
                is_additional_item: true,
            }));
        }
        else {
            itemsToAdd.push(item);
            additionalNewItems.push(em.create((0, utils_1.toMikroORMEntity)(_models_1.OrderClaimItem), {
                quantity: item.quantity,
                unit_price: item.unit_price,
                note: item.note,
                metadata: item.metadata,
                is_additional_item: true,
            }));
        }
    });
    const createItems = await service.orderLineItemService_.create(itemsToAdd, sharedContext);
    createItems.forEach((item, index) => {
        const addedItem = itemsToAdd[index];
        additionalNewItems[index].item_id = item.id;
        actions.push({
            action: utils_1.ChangeActionType.ITEM_ADD,
            claim_id: claimReference.id,
            internal_note: addedItem.internal_note,
            reference: "claim",
            reference_id: claimReference.id,
            details: {
                reference_id: item.id,
                claim_id: claimReference.id,
                quantity: addedItem.quantity,
                unit_price: item.unit_price,
                metadata: addedItem.metadata,
            },
        });
    });
    return additionalNewItems.concat(additionalItems);
}
async function processShippingMethods(service, data, claimReference, actions, sharedContext) {
    for (const shippingMethod of data.shipping_methods ?? []) {
        let shippingMethodId;
        if (!(0, utils_1.isString)(shippingMethod)) {
            const methods = await service.createOrderShippingMethods([
                {
                    ...shippingMethod,
                    order_id: data.order_id,
                    claim_id: claimReference.id,
                },
            ], sharedContext);
            shippingMethodId = methods[0].id;
        }
        else {
            shippingMethodId = shippingMethod;
        }
        const method = await service.retrieveOrderShippingMethod(shippingMethodId, { relations: ["tax_lines", "adjustments"] }, sharedContext);
        const calculatedAmount = (0, utils_1.getShippingMethodsTotals)([method], {})[method.id];
        actions.push({
            action: utils_1.ChangeActionType.SHIPPING_ADD,
            reference: "order_shipping_method",
            reference_id: shippingMethodId,
            claim_id: claimReference.id,
            amount: calculatedAmount.total,
        });
    }
}
async function processReturnShipping(service, data, claimReference, returnReference, actions, sharedContext) {
    if (!returnReference) {
        return;
    }
    if (data.return_shipping) {
        let returnShippingMethodId;
        if (!(0, utils_1.isString)(data.return_shipping)) {
            const methods = await service.createOrderShippingMethods([
                {
                    ...data.return_shipping,
                    order_id: data.order_id,
                    claim_id: claimReference.id,
                    return_id: returnReference.id,
                },
            ], sharedContext);
            returnShippingMethodId = methods[0].id;
        }
        else {
            returnShippingMethodId = data.return_shipping;
        }
        const method = await service.retrieveOrderShippingMethod(returnShippingMethodId, { relations: ["tax_lines", "adjustments"] }, sharedContext);
        const calculatedAmount = (0, utils_1.getShippingMethodsTotals)([method], {})[method.id];
        actions.push({
            action: utils_1.ChangeActionType.SHIPPING_ADD,
            reference: "order_shipping_method",
            reference_id: returnShippingMethodId,
            return_id: returnReference.id,
            claim_id: claimReference.id,
            amount: calculatedAmount.total,
        });
    }
}
async function createClaim(data, sharedContext) {
    const order = await this.orderService_.retrieve(data.order_id, { relations: ["items"] }, sharedContext);
    const actions = [];
    const em = sharedContext.transactionManager;
    const { claimReference, returnReference } = createClaimAndReturnEntities(em, data, order);
    const [claimItems, returnItems] = createClaimAndReturnItems(em, data, claimReference, returnReference, actions);
    claimReference.claim_items = claimItems;
    if (returnReference) {
        returnReference.items = returnItems;
    }
    claimReference.additional_items = await processAdditionalItems(em, this, data, order, claimReference, actions, sharedContext);
    await processShippingMethods(this, data, claimReference, actions, sharedContext);
    await processReturnShipping(this, data, claimReference, returnReference, actions, sharedContext);
    const change = await this.createOrderChange_({
        order_id: data.order_id,
        claim_id: claimReference.id,
        return_id: returnReference.id,
        change_type: utils_1.OrderChangeType.CLAIM,
        reference: "claim",
        reference_id: claimReference.id,
        description: data.description,
        internal_note: data.internal_note,
        created_by: data.created_by,
        metadata: data.metadata,
        actions,
    }, sharedContext);
    await (0, utils_1.promiseAll)([
        this.createReturns([returnReference], sharedContext),
        this.createOrderClaims([claimReference], sharedContext),
        this.confirmOrderChange(change[0].id, sharedContext),
    ]);
    return claimReference;
}
//# sourceMappingURL=create-claim.js.map