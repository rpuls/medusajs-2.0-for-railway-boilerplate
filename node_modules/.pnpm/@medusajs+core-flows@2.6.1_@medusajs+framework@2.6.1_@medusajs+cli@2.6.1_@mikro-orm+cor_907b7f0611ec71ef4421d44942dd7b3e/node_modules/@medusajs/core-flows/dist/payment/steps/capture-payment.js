"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capturePaymentStep = exports.capturePaymentStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.capturePaymentStepId = "capture-payment-step";
/**
 * This step captures a payment.
 */
exports.capturePaymentStep = (0, workflows_sdk_1.createStep)(exports.capturePaymentStepId, async (input, { container }) => {
    const paymentModule = container.resolve(utils_1.Modules.PAYMENT);
    const payment = await paymentModule.capturePayment(input);
    return new workflows_sdk_1.StepResponse(payment);
}
// We don't want to compensate a capture automatically as the actual funds have already been taken.
// The only want to compensate here is to issue a refund, but it's better to leave that as a manual operation for now.
);
//# sourceMappingURL=capture-payment.js.map