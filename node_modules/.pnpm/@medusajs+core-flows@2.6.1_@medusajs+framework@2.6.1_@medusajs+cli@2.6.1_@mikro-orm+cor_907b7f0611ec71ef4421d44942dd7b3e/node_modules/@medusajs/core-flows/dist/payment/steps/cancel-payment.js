"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPaymentStep = exports.cancelPaymentStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.cancelPaymentStepId = "cancel-payment-step";
/**
 * This step cancels one or more payments.
 */
exports.cancelPaymentStep = (0, workflows_sdk_1.createStep)(exports.cancelPaymentStepId, async (input, { container }) => {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const paymentModule = container.resolve(utils_1.Modules.PAYMENT);
    const paymentIds = Array.isArray(input.paymentIds)
        ? input.paymentIds
        : [input.paymentIds];
    const promises = [];
    for (const id of paymentIds) {
        promises.push(paymentModule.cancelPayment(id).catch((e) => {
            logger.error(`Error was thrown trying to cancel payment - ${id} - ${e}`);
        }));
    }
    await (0, utils_1.promiseAll)(promises);
});
//# sourceMappingURL=cancel-payment.js.map