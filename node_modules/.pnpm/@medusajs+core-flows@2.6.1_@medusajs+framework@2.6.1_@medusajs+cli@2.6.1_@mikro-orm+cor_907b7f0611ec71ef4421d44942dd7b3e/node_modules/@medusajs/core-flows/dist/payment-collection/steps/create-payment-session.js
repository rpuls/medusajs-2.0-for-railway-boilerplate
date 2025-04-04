"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentSessionStep = exports.createPaymentSessionStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createPaymentSessionStepId = "create-payment-session";
/**
 * This step creates a payment session.
 */
exports.createPaymentSessionStep = (0, workflows_sdk_1.createStep)(exports.createPaymentSessionStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.PAYMENT);
    const session = await service.createPaymentSession(input.payment_collection_id, {
        provider_id: input.provider_id,
        currency_code: input.currency_code,
        amount: input.amount,
        data: input.data ?? {},
        context: input.context,
    });
    return new workflows_sdk_1.StepResponse(session, session.id);
}, async (createdSession, { container }) => {
    if (!createdSession) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PAYMENT);
    await service.deletePaymentSession(createdSession);
});
//# sourceMappingURL=create-payment-session.js.map