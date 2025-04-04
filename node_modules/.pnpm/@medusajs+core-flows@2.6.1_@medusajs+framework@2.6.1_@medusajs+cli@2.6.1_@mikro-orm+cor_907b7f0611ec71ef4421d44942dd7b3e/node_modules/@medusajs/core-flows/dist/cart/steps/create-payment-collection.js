"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentCollectionsStep = exports.createPaymentCollectionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createPaymentCollectionsStepId = "create-payment-collections";
/**
 * This step creates payment collections in a cart.
 *
 * @example
 * const data = createPaymentCollectionsStep([{
 *   "currency_code": "usd",
 *   "amount": 40
 * }])
 */
exports.createPaymentCollectionsStep = (0, workflows_sdk_1.createStep)(exports.createPaymentCollectionsStepId, async (data, { container }) => {
    if (!data?.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const service = container.resolve(utils_1.Modules.PAYMENT);
    const created = await service.createPaymentCollections(data);
    return new workflows_sdk_1.StepResponse(created, created.map((collection) => collection.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PAYMENT);
    await service.deletePaymentCollections(createdIds);
});
//# sourceMappingURL=create-payment-collection.js.map