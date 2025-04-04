"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePaymentCollectionStep = exports.updatePaymentCollectionStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updatePaymentCollectionStepId = "update-payment-collection";
/**
 * This step updates payment collections matching the specified filters.
 *
 * @example
 * const data = updatePaymentCollectionStep({
 *   selector: {
 *     id: "paycol_123",
 *   },
 *   update: {
 *     amount: 10,
 *   }
 * })
 */
exports.updatePaymentCollectionStep = (0, workflows_sdk_1.createStep)(exports.updatePaymentCollectionStepId, async (data, { container }) => {
    if (!(0, utils_1.isPresent)(data) || !(0, utils_1.isPresent)(data.selector)) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const paymentModuleService = container.resolve(utils_1.Modules.PAYMENT);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await paymentModuleService.listPaymentCollections(data.selector, {
        select: selects,
        relations,
    });
    const updated = await paymentModuleService.updatePaymentCollections(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(updated, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const paymentModuleService = container.resolve(utils_1.Modules.PAYMENT);
    await paymentModuleService.upsertPaymentCollections(prevData.map((pc) => ({
        id: pc.id,
        amount: pc.amount,
        currency_code: pc.currency_code,
        metadata: pc.metadata,
    })));
});
//# sourceMappingURL=update-payment-collection.js.map