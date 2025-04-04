"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPaymentStep = exports.refundPaymentStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.refundPaymentStepId = "refund-payment-step";
/**
 * This step refunds a payment.
 */
exports.refundPaymentStep = (0, workflows_sdk_1.createStep)(exports.refundPaymentStepId, async (input, { container }) => {
    const paymentModule = container.resolve(utils_1.Modules.PAYMENT);
    const payment = await paymentModule.refundPayment(input);
    return new workflows_sdk_1.StepResponse(payment);
}
// We don't want to compensate a refund automatically as the actual funds have already been sent
// And in most cases we can't simply do another capture/authorization
);
//# sourceMappingURL=refund-payment.js.map